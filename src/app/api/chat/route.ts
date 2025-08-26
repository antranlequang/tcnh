import { NextRequest, NextResponse } from 'next/server';
import { personalAdvisorChat } from '@/ai/flows/personal-advisor-chat';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, context } = body;

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    // Use Gemini AI for intelligent responses
    const aiResult = await personalAdvisorChat({
      message,
      context: context || {}
    });

    return NextResponse.json({ response: aiResult.response });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback to simple response if AI fails
    const fallbackResponse = generateSimpleResponse(message, context);
    return NextResponse.json({ response: fallbackResponse });
  }
}

function generateSimpleResponse(message: string, context: any): string {
  const department = context?.departmentInfo;
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based responses
  if (lowerMessage.includes('tại sao') || lowerMessage.includes('phù hợp')) {
    return `Dựa trên kết quả test, bạn phù hợp với ${department?.name} vì bạn thể hiện những đặc điểm sau:
    
✨ **Điểm mạnh của bạn:**
${department?.strengths?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || ''}

Những điểm mạnh này rất phù hợp với yêu cầu công việc của ban này. Bạn có muốn tôi giải thích thêm về các hoạt động cụ thể của ban không?`;
  }

  if (lowerMessage.includes('hoạt động') || lowerMessage.includes('làm gì')) {
    const activities: Record<string, string> = {
      'A': 'quản lý website, phát triển ứng dụng, hỗ trợ kỹ thuật cho các sự kiện, tạo nội dung số',
      'B': 'tổ chức các hoạt động tình nguyện, thiện nguyện, hỗ trợ cộng đồng, các chương trình xã hội',
      'C': 'tổ chức sự kiện, quảng bá hoạt động Đoàn, thiết kế poster, quay dựng video, truyền thông',
      'D': 'quản lý tổ chức, phát triển thành viên, lập kế hoạch hoạt động, điều phối các ban'
    };
    
    return `${department?.name} sẽ tham gia các hoạt động như: ${activities[context?.department] || 'các hoạt động đa dạng'}.

Dựa trên kết quả test, bạn sẽ phát huy tốt nhất trong các công việc này vì bạn có năng khiếu và sở thích phù hợp.

Bạn có muốn biết về cách thức tham gia hoặc chuẩn bị gì để bắt đầu không?`;
  }

  if (lowerMessage.includes('phát triển') || lowerMessage.includes('cải thiện')) {
    return `Để phát triển tốt trong ${department?.name}, tôi khuyên bạn:

🎯 **Điểm cần cải thiện:**
${department?.weaknesses?.map((w: string, i: number) => `${i + 1}. ${w}`).join('\n') || ''}

💡 **Gợi ý phát triển:**
- Tham gia các khóa học online liên quan
- Tìm mentor trong ban để học hỏi
- Thực hành qua các dự án nhỏ
- Tham gia các workshop và training

Bạn muốn tôi gợi ý cụ thể về khóa học hoặc kỹ năng nào không?`;
  }

  if (lowerMessage.includes('ban khác') || lowerMessage.includes('thay đổi')) {
    return `Kết quả test chỉ mang tính tham khảo! Bạn hoàn toàn có thể tham gia các ban khác:

🏢 **Communications - Technical Board**: Phù hợp nếu bạn yêu thích công nghệ
👥 **Movement - Voluntary**: Dành cho người có tinh thần tình nguyện
📢 **Propaganda Department - Events**: Cho những ai sáng tạo và thích tổ chức sự kiện  
🏛️ **Organizing Committee**: Phù hợp với người có năng lực lãnh đạo

Quan trọng là bạn chọn ban mà mình có đam mê và muốn đóng góp. Bạn có muốn tìm hiểu về ban nào khác không?`;
  }

  if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks')) {
    return `Rất vui được hỗ trợ bạn! 😊

Chúc bạn tìm được ban phù hợp và có những trải nghiệm tuyệt vời trong Đoàn Khoa Tài chính - Ngân hàng.

Nếu bạn có thêm câu hỏi gì về quá trình ứng tuyển hay các hoạt động của Đoàn, đừng ngần ngại hỏi tôi nhé!`;
  }

  // Default response
  return `Cảm ơn bạn đã chia sẻ! Dựa trên kết quả test, bạn rất phù hợp với ${department?.name}.

Tôi có thể giúp bạn:
- Giải thích tại sao bạn phù hợp với ban này
- Chia sẻ về các hoạt động cụ thể của ban
- Đưa ra lời khuyên phát triển cá nhân
- So sánh với các ban khác

Bạn muốn tìm hiểu về điều gì? 😊`;
}