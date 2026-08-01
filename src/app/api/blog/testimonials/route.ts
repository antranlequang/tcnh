import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { convertBlogImageToWebp } from "@/lib/blogImageProcessing";
import {
  mapTestimonialRow,
  serializeTestimonialImageUrls,
  TESTIMONIAL_SELECT_COLUMNS,
} from "@/lib/blog";
import { serializeError } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOG_TESTIMONIALS_BUCKET = "blog-testimonials";
const MAX_IMAGE_COUNT = 10;

async function ensureBlogTestimonialsBucket() {
  if (!supabaseAdmin) return;

  const { data: bucket, error: getBucketError } = await supabaseAdmin.storage.getBucket(
    BLOG_TESTIMONIALS_BUCKET
  );

  if (!getBucketError && bucket) {
    const { error: updateError } = await supabaseAdmin.storage.updateBucket(
      BLOG_TESTIMONIALS_BUCKET,
      {
        public: true,
        fileSizeLimit: null,
        allowedMimeTypes: ["image/webp"],
      }
    );
    if (updateError) throw updateError;
    return;
  }

  const missingBucket =
    getBucketError && /not\s*found|does\s*not\s*exist/i.test(getBucketError.message);
  if (getBucketError && !missingBucket) throw getBucketError;

  const { error } = await supabaseAdmin.storage.createBucket(BLOG_TESTIMONIALS_BUCKET, {
    public: true,
    fileSizeLimit: null,
    allowedMimeTypes: ["image/webp"],
  });

  if (error && !/already\s*exists|duplicate/i.test(error.message)) throw error;
}

export async function GET() {
  try {
    const db = supabase ?? supabaseAdmin;

    if (!db) {
      return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 500 });
    }

    const { data, error } = await db
      .from("alumni_testimonials")
      .select(TESTIMONIAL_SELECT_COLUMNS)
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: (data || []).map(mapTestimonialRow) },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (e) {
    return NextResponse.json({ success: false, message: serializeError(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const uploadedPaths: string[] = [];

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Hệ thống gửi bài chưa được cấu hình đầy đủ." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const fullName = String(formData.get("fullName") || "").trim();
    const position = String(formData.get("position") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const legacyImage = formData.get("image");
    const images = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (images.length === 0 && legacyImage instanceof File && legacyImage.size > 0) {
      images.push(legacyImage);
    }

    if (!fullName || !message) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập họ tên và lời gửi gắm." },
        { status: 400 }
      );
    }

    if (fullName.length > 120 || position.length > 160 || message.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Nội dung vượt quá độ dài cho phép." },
        { status: 400 }
      );
    }

    if (images.length > MAX_IMAGE_COUNT) {
      return NextResponse.json(
        { success: false, message: `Mỗi bài viết được đăng tối đa ${MAX_IMAGE_COUNT} hình ảnh.` },
        { status: 400 }
      );
    }

    const testimonialId = randomUUID();
    const imageUrls: string[] = [];
    if (images.length > 0) {
      await ensureBlogTestimonialsBucket();

      for (const [index, image] of images.entries()) {
        let imageBuffer: Buffer;
        try {
          imageBuffer = await convertBlogImageToWebp(await image.arrayBuffer(), {
            fileName: image.name,
            mimeType: image.type,
          });
        } catch {
          if (uploadedPaths.length > 0) {
            await supabaseAdmin.storage.from(BLOG_TESTIMONIALS_BUCKET).remove(uploadedPaths);
            uploadedPaths.length = 0;
          }
          return NextResponse.json(
            {
              success: false,
              message: `Không thể đọc tệp “${image.name}”. Vui lòng chọn một tệp hình ảnh hợp lệ.`,
            },
            { status: 400 }
          );
        }
        const uploadedPath = `${testimonialId}/image-${index + 1}.webp`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from(BLOG_TESTIMONIALS_BUCKET)
          .upload(uploadedPath, imageBuffer, {
            contentType: "image/webp",
            upsert: false,
          });
        if (uploadError) throw uploadError;
        uploadedPaths.push(uploadedPath);

        const { data: publicUrlData } = supabaseAdmin.storage
          .from(BLOG_TESTIMONIALS_BUCKET)
          .getPublicUrl(uploadedPath);
        imageUrls.push(publicUrlData.publicUrl);
      }
    }

    const { data, error } = await supabaseAdmin
      .from("alumni_testimonials")
      .insert({
        id: testimonialId,
        full_name: fullName,
        avatar_url: serializeTestimonialImageUrls(imageUrls),
        positions: position ? [position] : [],
        message,
        is_published: false,
        display_order: 0,
      })
      .select(TESTIMONIAL_SELECT_COLUMNS)
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: "Bài gửi đang chờ quản trị viên phê duyệt.",
        data: mapTestimonialRow(data),
      },
      { status: 201 }
    );
  } catch (error) {
    if (uploadedPaths.length > 0 && supabaseAdmin) {
      await supabaseAdmin.storage.from(BLOG_TESTIMONIALS_BUCKET).remove(uploadedPaths);
    }

    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}
