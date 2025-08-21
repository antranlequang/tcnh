"use server";

import { z } from 'zod';
import { moderateBlogComments } from '@/ai/flows/moderate-blog-comments';
import { analyzeApplication } from '@/ai/flows/analyze-application';
import { ContactFormSchema, CommentFormSchema, ApplicationFormSchema, type ContactFormState, type CommentFormState, type ApplicationFormState } from '@/lib/definitions';
import { appendApplicationToSheet, appendContactToSheet } from '@/lib/google-sheets';


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
  const validatedFields = CommentFormSchema.safeParse({
    name: formData.get('name'),
    comment: formData.get('comment'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      issues: Object.values(validatedFields.error.flatten().fieldErrors).flat().filter(Boolean),
    };
  }

  const { name, comment } = validatedFields.data;

  try {
    const moderationResult = await moderateBlogComments({ comment });

    if (!moderationResult.isSafe) {
      return {
        message: "Comment cannot be posted.",
        isSafe: false,
        reason: moderationResult.reason || "This comment violates our community guidelines.",
      };
    }
    
    // In a real app, you would save the comment to a database here.
    console.log("New safe comment submitted by:", name);
    
    return {
      message: "Your comment has been posted!",
      isSafe: true,
    };

  } catch (error) {
    console.error("Error moderating comment:", error);
    return {
      message: "Your comment has been posted! (Moderation service unavailable)",
      isSafe: true,
    }
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
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      facebookLink: formData.get('facebookLink')?.toString() || '',
      portraitPhoto: formData.get('portraitPhoto') || null,
      reason: formData.get('reason')?.toString() || '',
      expectation: formData.get('expectation')?.toString() || '',
      situation: formData.get('situation')?.toString() || '',
      department: formData.get('department')?.toString(),
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

    const applicationData = validatedFields.data;

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

    // Thử phân tích đơn ứng tuyển (có thể fail)
    let analysis = '';
    try {
      const analysisResult = await analyzeApplication({
          reason: applicationData.reason,
          expectation: applicationData.expectation,
          situation: applicationData.situation
      });
      analysis = analysisResult.analysis || '';
    } catch (analysisError) {
      console.error("Error analyzing application:", analysisError);
      analysis = 'Phân tích tạm thời không khả dụng.';
    }

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
