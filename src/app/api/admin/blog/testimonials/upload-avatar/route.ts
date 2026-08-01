import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/adminAuth";
import { convertBlogImageToWebp } from "@/lib/blogImageProcessing";
import { isUuid } from "@/lib/blog";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { serializeError } from "@/lib/utils";

const BLOG_TESTIMONIALS_BUCKET = "blog-testimonials";

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

  if (getBucketError && !missingBucket) {
    throw getBucketError;
  }

  const { error: createBucketError } = await supabaseAdmin.storage.createBucket(
    BLOG_TESTIMONIALS_BUCKET,
    {
      public: true,
      fileSizeLimit: null,
      allowedMimeTypes: ["image/webp"],
    }
  );

  if (
    createBucketError &&
    !/already\s*exists|duplicate/i.test(createBucketError.message)
  ) {
    throw createBucketError;
  }
}

export async function POST(request: Request) {
  try {
    const authError = await assertAdminRequest(request);
    if (authError) return authError;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Supabase admin client not configured." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const providedId = formData.get("testimonialId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
    }

    await ensureBlogTestimonialsBucket();

    const testimonialId = isUuid(providedId) ? providedId : randomUUID();

    let webpBuffer: Buffer;
    try {
      webpBuffer = await convertBlogImageToWebp(await file.arrayBuffer(), {
        fileName: file.name,
        mimeType: file.type,
      });
    } catch {
      return NextResponse.json(
        { success: false, message: "Không thể đọc tệp này. Vui lòng chọn một tệp hình ảnh hợp lệ." },
        { status: 400 }
      );
    }

    const objectPath = `${testimonialId}/avatar.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BLOG_TESTIMONIALS_BUCKET)
      .upload(objectPath, webpBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, message: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BLOG_TESTIMONIALS_BUCKET)
      .getPublicUrl(objectPath);

    return NextResponse.json({
      success: true,
      data: {
        testimonialId,
        avatarUrl: publicUrlData?.publicUrl || "",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: serializeError(error) },
      { status: 500 }
    );
  }
}
