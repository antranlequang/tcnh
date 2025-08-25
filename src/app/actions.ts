"use server";

import { z } from 'zod';
// import { moderateBlogComments } from '@/ai/flows/moderate-blog-comments';
// import { analyzeApplication } from '@/ai/flows/analyze-application';
import { ContactFormSchema, CommentFormSchema, ApplicationFormSchema, type ContactFormState, type CommentFormState, type ApplicationFormState } from '@/lib/definitions';
import { appendApplicationToSheet, appendContactToSheet, appendCommentToSheet } from '@/lib/google-sheets';
import { google } from "googleapis";
import { Readable } from "stream";
import { supabase } from "@/lib/supabaseClient";

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      issues: Object.values(validatedFields.error.flatten().fieldErrors).flat().filter(Boolean),
      fields: {
        name: formData.get('name')?.toString() ?? '',
        email: formData.get('email')?.toString() ?? '',
        message: formData.get('message')?.toString() ?? '',
      }
    };
  }

  const { name, email, message } = validatedFields.data;

  try {
    // Ghi dữ liệu vào Google Sheet
    await appendContactToSheet({ name, email, message });
    
    return { message: `Thank you, ${name}! Your message has been received and saved.` };
  } catch (error) {
    console.error("Error saving to Google Sheet:", error);
    return { message: `Thank you, ${name}! Your message has been received.` };
  }
}

export async function submitComment(
  prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const rawData = {
    name: formData.get('name')?.toString() || null,
    comment: formData.get('comment')?.toString() || '',
    parentId: formData.get('parentId')?.toString() || null,
    isAnonymous: formData.get('isAnonymous') === 'true',
  };

  const validatedFields = CommentFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      issues: Object.values(validatedFields.error.flatten().fieldErrors).flat().filter(Boolean),
    };
  }

  const { name, comment, parentId, isAnonymous } = validatedFields.data;

  try {
    // AI content moderation disabled
    // const moderationResult = await moderateBlogComments({ comment });

    // if (!moderationResult.isSafe) {
    //   return {
    //     message: "Bình luận không thể đăng do vi phạm quy định cộng đồng.",
    //     isSafe: false,
    //     reason: moderationResult.reason || "Nội dung không phù hợp với tiêu chuẩn cộng đồng.",
    //   };
    // }

    // Insert comment into Supabase
    const { error } = await supabase.from("comments").insert({
      name: isAnonymous ? null : name,
      comment,
      parent_id: parentId,
      is_anonymous: isAnonymous,
      avatar: null,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        message: "Không thể lưu bình luận. Vui lòng thử lại.",
        isSafe: false,
        reason: error.message,
      };
    }

    return {
      message: "Bình luận của bạn đã được đăng thành công!",
      isSafe: true,
    };
  } catch (error) {
    console.error("Error processing comment:", error);
    return {
      message: "Đã có lỗi xảy ra. Vui lòng thử lại.",
      isSafe: false,
    };
  }
}

export async function submitApplication(
  prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  try {
    // Debug log
    console.log('FormData received:', {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      facebookLink: formData.get('facebookLink'),
      portraitPhoto: formData.get('portraitPhoto'),
      reason: formData.get('reason'),
      expectation: formData.get('expectation'),
      situation: formData.get('situation'),
      department: formData.get('department'),
    });

    const validatedFields = ApplicationFormSchema.safeParse({
      fullName: formData.get('fullName')?.toString() || '',
      birthDate: formData.get('birthDate')?.toString() || '',
      gender: formData.get('gender')?.toString() || '',
      studentId: formData.get('studentId')?.toString() || '',
      className: formData.get('className')?.toString() || '',
      schoolEmail: formData.get('schoolEmail')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      facebookLink: formData.get('facebookLink')?.toString() || '',
      currentAddress: formData.get('currentAddress')?.toString() || '',
      transport: formData.get('transport')?.toString() || '',
      healthIssues: formData.get('healthIssues')?.toString() || '',
      strengthsWeaknesses: formData.get('strengthsWeaknesses')?.toString() || '',
      specialSkills: formData.get('specialSkills')?.toString() || '',
      portraitPhoto: formData.get('portraitPhoto') || null,
      impression: formData.get('impression')?.toString() || '',
      experience: formData.get('experience')?.toString() || '',
      extrovert: formData.get('extrovert')?.toString() || '',
      teamwork: formData.get('teamwork')?.toString() || '',
      department: formData.get('department')?.toString() || '',
      deptQuestion1: formData.get('deptQuestion1')?.toString() || '',
      deptQuestion2: formData.get('deptQuestion2')?.toString() || '',
    });

    if (!validatedFields.success) {
      const fields: Record<string, string> = {};
      for (const key in validatedFields.error.flatten().fieldErrors) {
          const value = formData.get(key);
          if (typeof value === 'string') {
              fields[key] = value;
          }
      }
      
      // Log validation errors để debug
      console.log('Validation errors:', validatedFields.error.flatten().fieldErrors);
      
      return {
        message: "Lỗi xác thực. Vui lòng kiểm tra lại thông tin.",
        issues: Object.values(validatedFields.error.flatten().fieldErrors).flat().filter(Boolean),
        fields
      };
    }

    const applicationData = {
      ...validatedFields.data,
      healthIssues: validatedFields.data.healthIssues || '',
    };

    // Ghi dữ liệu vào Google Sheet (có thể fail)
    let sheetUrl: string | undefined = undefined;
    let sheetWriteOk = true;
    try {
      const result = await appendApplicationToSheet(applicationData);
      if (result?.sheetUrl) {
        sheetUrl = result.sheetUrl;
        console.log('Application saved to sheet:', sheetUrl);
      }
      if (!result?.success) {
        sheetWriteOk = false;
        console.error('Google Sheet write failed:', result?.message);
      }
    } catch (sheetError) {
      console.error("Error writing to Google Sheet:", sheetError);
      // Không fail form nếu Google Sheets fail
      sheetWriteOk = false;
    }

    // AI analysis disabled
    // let analysis = '';
    // try {
    //   const analysisResult = await analyzeApplication({
    //       reason: applicationData.impression,
    //       expectation: applicationData.experience,
    //       situation: applicationData.teamwork
    //   });
    //   analysis = analysisResult.analysis || '';
    // } catch (analysisError) {
    //   console.error("Error analyzing application:", analysisError);
    //   analysis = 'Phân tích tạm thời không khả dụng.';
    // }
    const analysis = '';

    return { 
      message: sheetWriteOk
        ? `Cảm ơn bạn ${applicationData.fullName}! Đơn ứng tuyển của bạn đã được gửi thành công.`
        : `Đơn đã nhận nhưng chưa ghi được vào Google Sheets. Vui lòng kiểm tra cấu hình và thử lại.`,
      analysis: analysis,
      sheetUrl,
      issues: sheetWriteOk ? undefined : ['Không thể ghi vào Google Sheets. Kiểm tra GOOGLE_SHEET_ID, quyền share, và credentials.'],
    };

  } catch (error) {
    console.error("Error submitting application:", error);
    return {
      message: "Đã xảy ra lỗi khi gửi đơn. Vui lòng thử lại sau.",
      issues: [],
    }
  }
}
