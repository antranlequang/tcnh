'use server';

/**
 * @fileOverview AI-powered personal advisor chat for student department matching.
 *
 * - personalAdvisorChat - A function that provides personalized advice based on quiz results
 * - PersonalAdvisorChatInput - The input type for the personalAdvisorChat function
 * - PersonalAdvisorChatOutput - The return type for the personalAdvisorChat function
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalAdvisorChatInputSchema = z.object({
  message: z
    .string()
    .describe("The user's message or question"),
  context: z.object({
    departmentInfo: z.object({
      name: z.string().describe("Name of the recommended department"),
      description: z.string().describe("Description of the department"),
      strengths: z.array(z.string()).describe("User's identified strengths"),
      weaknesses: z.array(z.string()).describe("Areas for improvement")
    }).optional(),
    quizScores: z.object({
      A: z.number().describe("Score for Technical/IT department"),
      B: z.number().describe("Score for Voluntary/Social department"), 
      C: z.number().describe("Score for Events/Communications department"),
      D: z.number().describe("Score for Leadership/Management department")
    }).optional(),
    department: z.string().describe("Recommended department code (A/B/C/D)"),
    isReturningUser: z.boolean().optional().describe("Whether this is a returning user"),
    previousDepartments: z.array(z.string()).optional().describe("Previously recommended departments"),
    chatCount: z.number().optional().describe("Number of previous chat sessions")
  }).describe("Context from quiz results and user profile")
});

export type PersonalAdvisorChatInput = z.infer<typeof PersonalAdvisorChatInputSchema>;

const PersonalAdvisorChatOutputSchema = z.object({
  response: z
    .string()
    .describe("Personalized, helpful response in Vietnamese addressing the user's question based on their quiz results and department match")
});

export type PersonalAdvisorChatOutput = z.infer<typeof PersonalAdvisorChatOutputSchema>;

export async function personalAdvisorChat(input: PersonalAdvisorChatInput): Promise<PersonalAdvisorChatOutput> {
  return personalAdvisorChatFlow(input);
}

const personalAdvisorChatPrompt = ai.definePrompt({
  name: 'personalAdvisorChatPrompt',
  input: {schema: PersonalAdvisorChatInputSchema},
  output: {schema: PersonalAdvisorChatOutputSchema},
  prompt: `Bạn là một AI advisor chuyên nghiệp cho sinh viên Đoàn Khoa Tài chính - Ngân hàng.

Thông tin về người dùng:
- Người dùng cũ: {{{context.isReturningUser}}} 
- Số lần chat: {{{context.chatCount}}}
- Ban đã từng được gợi ý: {{{context.previousDepartments}}}

Kết quả test hiện tại:
- Ban phù hợp: {{{context.departmentInfo.name}}}
- Mô tả ban: {{{context.departmentInfo.description}}}
- Điểm mạnh: {{{context.departmentInfo.strengths}}}
- Điểm cần phát triển: {{{context.departmentInfo.weaknesses}}}
- Điểm số quiz: A={{{context.quizScores.A}}}, B={{{context.quizScores.B}}}, C={{{context.quizScores.C}}}, D={{{context.quizScores.D}}}

Các ban trong Đoàn Khoa:
- Ban A (Communications - Technical Board): quản lý website, phát triển ứng dụng, hỗ trợ kỹ thuật cho các sự kiện, tạo nội dung số
- Ban B (Movement - Voluntary): tổ chức các hoạt động tình nguyện, thiện nguyện, hỗ trợ cộng đồng, các chương trình xã hội  
- Ban C (Propaganda Department - Events): tổ chức sự kiện, quảng bá hoạt động Đoàn, thiết kế poster, quay dựng video, truyền thông
- Ban D (Organizing Committee): quản lý tổ chức, phát triển thành viên, lập kế hoạch hoạt động, điều phối các ban

Hướng dẫn trả lời:
1. Nếu là người dùng cũ, hãy tham chiếu đến lịch sử của họ một cách thân thiện
2. So sánh kết quả hiện tại với kết quả trước đó (nếu có)
3. Đưa ra lời khuyên phát triển cá nhân dựa trên xu hướng
4. Giải thích tại sao người dùng phù hợp với ban này
5. Gợi ý các hoạt động và kỹ năng cần phát triển
6. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp

Câu hỏi của người dùng: {{{message}}}

Hãy trả lời ngắn gọn (2-4 câu), hữu ích và cá nhân hóa. Nếu là người dùng cũ, hãy thể hiện sự ghi nhớ về cuộc trò chuyện trước. Sử dụng emoji phù hợp để tạo sự thân thiện.`,
});

const personalAdvisorChatFlow = ai.defineFlow(
  {
    name: 'personalAdvisorChatFlow',
    inputSchema: PersonalAdvisorChatInputSchema,
    outputSchema: PersonalAdvisorChatOutputSchema,
  },
  async input => {
    const {output} = await personalAdvisorChatPrompt(input);
    return output!;
  }
);