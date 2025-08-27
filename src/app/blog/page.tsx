import Image from 'next/image';
import Link from 'next/link';
import { PageBanner } from '@/components/shared/PageBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

const testimonials = [
  {
    name: 'PHAN NHẬT MINH TRUNG - Khóa 18',
    positions: ['Cựu Bí thư Đoàn Khoa', 'Cựu Trưởng ban Truyền thông - Kỹ thuật', 'Cựu Trưởng ban Tổ chức - Xây dựng Đoàn'],
    avatar: '/images/blog/minhtrung.jpg',
    avatarHint: 'caovannhan',
    comment: 'Khoảng 4 năm đồng hành cùng Đoàn Khoa Tài chính - Ngân hàng là một hành trình thanh xuân đáng nhớ đối với mình. Cảm ơn Đoàn đã cho mình cơ hội được cống hiến, được trưởng thành và được sống hết mình với đam mê. Những buổi họp thâu đêm, những chương trình thành công rực rỡ và cả những khó khăn, thử thách đều đã trở thành kỷ niệm đẹp nhất. Từng ngày sống trong ngôi nhà chung ấy, mình đã học được cách lắng nghe, thấu hiểu, và quan trọng hơn cả là cách yêu thương. Giờ đây, khi đã thôi nhiệm vụ, mình muốn gửi gắm đến các em khóa sau lời nhắn nhủ chân thành: Hãy luôn giữ trong mình ngọn lửa nhiệt huyết, đam mê, và hãy coi Đoàn Khoa là ngôi nhà thứ hai của mình. Tin mình đi, những trải nghiệm tại đây sẽ là hành trang quý giá nhất trên con đường sự nghiệp và cuộc sống của các em sau này.'
  },
  {
    name: 'CAO VĂN NHÂN - Khóa 19',
    positions: ['Cựu Bí thư Đoàn Khoa', 'Cựu Trưởng ban Truyền thông - Kỹ thuật', 'Cựu Trưởng ban Tổ chức - Xây dựng Đoàn'],
    avatar: '/images/blog/vannhan.jpg',
    avatarHint: 'caovannhan',
    comment: 'Chào mấy bạn tân sinh viên ‘mầm non’ nha 🌱. Với anh thì Đoàn Khoa là một ngôi nhà nhỏ – chứa toàn bộ những kỷ niệm đắt giá nhất thời sinh viên. Ban đầu chỉ là tò mò, sôi nổi theo lửa Đoàn, gắn bó với trách nhiệm, cuối cùng là sự tự hào lớn gắn bó trong suốt 4 năm đại học. Ở đây mang theo những kỹ năng, trải nghiệm mới, những hành trình mới, gặp những ‘đồng chí’ cực dễ thương để cùng làm điều mình thích, và quan trọng nhất là bước đệm để trưởng thành hơn. Thế nên là bạn Đoàn không khô khan đâu nha – vui lắm, dễ thương lắm luôn đó! 😉'
  },
  {
    name: 'THÁI DƯƠNG THANH THẢO - Khóa 19',
    positions: ['Cựu Phó Bí thư Đoàn Khoa', 'Cựu Trưởng ban Tuyên giáo - Sự kiện'],
    avatar: '/images/blog/thanhthao.jpg',
    avatarHint: 'thanhthao',
    comment: 'Nhìn lại quãng đường đã qua cùng Đoàn Khoa Tài chính - Ngân hàng, mình nhận ra đó là một hành trình thanh xuân đáng nhớ. Cảm ơn Đoàn đã cho mình cơ hội được cống hiến, được trưởng thành và được sống hết mình với đam mê. Mình đã trải qua đủ mọi cung bậc cảm xúc, từ những đêm thức trắng để chạy chương trình đến những nụ cười rạng rỡ khi dự án thành công. Ở đây, mình đã học được cách lắng nghe, thấu hiểu, và quan trọng hơn cả là cách yêu thương. Đoàn Khoa không chỉ là một tổ chức, mà là một gia đình lớn, nơi mình tìm thấy những người bạn đồng hành và những kỷ niệm vô giá. Giờ đây, khi đã thôi nhiệm vụ, mình muốn gửi gắm đến các em: hãy luôn giữ trong mình ngọn lửa nhiệt huyết, đam mê, và hãy coi Đoàn Khoa là ngôi nhà thứ hai của mình. Tin mình đi, những trải nghiệm tại đây sẽ là hành trang quý giá nhất trên con đường sự nghiệp và cuộc sống của các em sau này.'
  },
  {
    name: 'NGUYỄN NGỌC HÂN - Khóa 20',
    positions: ['Cựu Bí thư Đoàn Khoa', 'Cựu Phó ban Truyền thông - Kỹ thuật', 'Cựu Trưởng ban Tổ chức - Xây dựng Đoàn'],
    avatar: '/images/blog/ngochan.JPG',
    avatarHint: 'nguyenngochan',
    comment: '4 năm Đại học gắn bó với Đoàn Khoa là khoảng thời gian mình nhận ra bản thân nhiều hơn. Ở đây, mình có cơ hội được bắt đầu những thứ mình chưa từng nghĩ là sẽ làm, được trau dồi các kỹ năng, tổ chức sự kiện cho hàng trăm bạn sinh viên, hay đơn giản là học cách lắng nghe và làm việc với nhiều tính cách khác nhau. Có lúc vui vì mọi thứ trơn tru, cũng có lúc mệt vì áp lực deadline chồng chất. Nhưng nhờ vậy mình biết mình chịu được đến đâu, mạnh ở điểm nào và yếu ở đâu. Đoàn Khoa với mình không chỉ là một “hoạt động ngoại khóa” để ghi CV, mà còn là nơi mang đến cho mình hành trang ra trường kỹ lưỡng và hoàn thiện nhất. Nếu không gặp ĐK, bản thân mình sẽ chỉ là một phiên bản an toàn hơn, ít trải nghiệm và ít câu chuyện để kể hơn rất nhiều. Cảm ơn Đoàn Khoa Tài chính - Ngân hàng rất nhiều!'
  },
  {
    name: 'ĐÀO THỊ THÙY DUNG - Khóa 21',
    positions: ['Nguyên Bí thư Đoàn Khoa', 'Nguyên Trưởng ban Tổ chức - Xây dựng Đoàn'],
    avatar: '/images/blog/thuydung.jpg',
    avatarHint: 'thuydung',
    comment: 'Hellu mấy bạn tân sinh diên nhó 🙋‍♀️. Chắc hẳn hành trình đại học của các bạn vừa mới bắt đầu thôi nhỉ, và Đoàn Khoa chính là nơi để bạn gieo những hạt mầm đầu tiên đấy 🌱. Chị sẽ chia sẻ xíu xíu với mấy bạn nhoa ^^. Đại học không chỉ là học hành và thi cử, mà còn là quãng thời gian để trải nghiệm, để gặp gỡ và để trưởng thành. Với chị, Đoàn Khoa chính là ‘cánh cửa’ đầu tiên mở ra những trải nghiệm ấy. Ở đây, mỗi thành viên đều có thể học được những kỹ năng mà sách vở không dạy, được sống trọn vẹn trong những hành trình đầy màu sắc của tuổi trẻ, và tìm thấy cảm giác luôn có ‘Nhà’ đồng hành nè. Đoàn Khoa không chỉ là hoạt động, mà còn là nơi lưu giữ những kỷ niệm quý giá nhất đời sinh viên. Ai đã một lần bước vào, chắc chắn sẽ mang về cho mình điều gì đó thật đặc biệt nè 🌷. "Đoàn Khoa không hứa cho bạn tất cả những gì bạn muốn, nhưng sẽ trao cho bạn tất cả những gì Đoàn Khoa có". Hãy thử một lần ‘ghé’ Đoàn Khoa, biết đâu bạn sẽ tìm thấy cho mình một ngôi nhà nhỏ của tuổi trẻ 🙆‍♀️'
  },
    {
    name: 'LÊ HOA ĐÀO - Khóa 21',
    positions: ['Nguyên Phó Bí thư Đoàn Khoa', 'Nguyên Trưởng ban Tuyên giáo - Sự kiện'],
    avatar: '/images/blog/hoadao.jpg',
    avatarHint: 'lehoadao',
    comment: 'Với mình, Đoàn Khoa Tài chính - Ngân hàng không chỉ là một tổ chức, mà là một gia đình lớn. Nơi đây, mình đã tìm thấy những người bạn, những người anh chị em luôn đồng hành và hỗ trợ mình trong mọi hoàn cảnh. Mình còn nhớ như in những đêm thức trắng cùng nhau để chuẩn bị cho các chương trình, những nụ cười rạng rỡ khi dự án thành công, và cả những giọt nước mắt khi gặp thất bại. Chính những khoảnh khắc ấy đã gắn kết chúng mình lại với nhau, tạo nên một sức mạnh phi thường. Khi mình rời đi, mình không cảm thấy buồn, mà thay vào đó là một niềm tin vững chắc. Mình tin rằng các em sẽ tiếp tục giữ gìn và phát huy những giá trị truyền thống tốt đẹp của Đoàn Khoa. Hãy luôn đoàn kết, luôn yêu thương và hãy cùng nhau tạo nên những dấu ấn riêng của thế hệ mình. Mình tin rằng các em sẽ làm tốt hơn cả những gì mà chúng mình đã từng làm.'
  },
  {
    name: 'HOÀNG NGUYỄN BẢO TRÂM - Khóa 21',
    positions: ['Nguyên UV.BCH Đoàn Khoa', 'Nguyên Trưởng ban Truyền thông - Kỹ thuật'],
    avatar: '/images/blog/baotram.jpg',
    avatarHint: 'baotram',
    comment: 'Không biết có nên viết mấy dòng này không nữa, chứ nghĩ tới quãng thời gian 3 năm gắn bó với Đoàn khoa, với ban Truyền thông – Kỹ thuật, tự dưng thấy trong lòng vừa bồi hồi lại vừa vui. Nhớ lúc mới vào thì cũng ngây ngô, lo sợ không biết mình có làm nổi không, rồi lại sợ mình không hòa nhập tốt. Vậy mà qua từng ngày, nhờ những người anh, người chị và các bạn hướng dẫn và giúp đỡ thì các kỹ năng của mình dần phát huy khá nhiều. Càng làm càng cuốn, mấy deadline dí thì dí thật, nhưng khi qua rồi thì lại nhớ cái cảm giác chạy cùng nhau tới sáng, cười giỡn ồn ào như cái chợ. Nhưng nhờ vậy mà cũng giảm được phần nào sự mệt mỏi. Ba năm gắn bó, điều mình nhớ nhất chắc không chỉ là những ấn phẩm, những chương trình mình đã từng làm, mà còn là cái không khí anh chị em trong ban luôn cười nhiều hơn than, lúc nào cũng chịu khó giúp đỡ nhau qua từng cái lỗi máy móc, từng cái banner gấp trong đêm. Nhiều lúc cũng stress lắm, nhưng nhờ vậy mới thấy mình mạnh mẽ hơn, tự tin hơn và trưởng thành lúc nào chẳng hay. Nếu có một lời để nhắn gửi cho các em sau này thì mình chỉ muốn nói: đừng sợ khó, đừng ngại thử. Cứ nhào vô, cứ làm hết mình vì ở Đoàn khoa đặc biệt là ban Truyền thông – Kỹ thuật, luôn có đồng đội kề bên. Đi cùng nhau mới thấy, những trải nghiệm này chính là thứ sẽ làm thanh xuân của tụi mình đáng nhớ hơn rất nhiều.'
  },
  {
    name: 'LÂM HỒNG MINH QUÂN - Khóa 22',
    positions: ['Nguyên Phó Bí thư Đoàn Khoa', 'Nguyên Trưởng ban Truyền thông - Kỹ thuật'],
    avatar: '/images/blog/minhquan.jpg',
    avatarHint: 'minhquan',
    comment: 'Chào các bạn tân sinh viên! Nếu hỏi anh quãng thời gian nào đẹp nhất trong 04 năm đại học, anh sẽ không ngần ngại trả lời: Đó chính là hành trình gắn bó với Đoàn Khoa. Từ những ngày đầu bước vào UEL, anh đã bị cuốn hút bởi ngọn lửa nhiệt huyết, sự năng động và sức trẻ của các anh chị Đoàn Khoa. Từ đó, anh biết rằng đây sẽ là nơi mình gửi gắm cả thanh xuân sinh viên. Ở Đoàn Khoa, anh không chỉ được học các kỹ năng, tích lũy kinh nghiệm, hay nhận được sự dìu dắt quý báu từ anh chị mà anh còn còn tìm thấy những người bạn tri kỷ, những người mà anh chưa từng nghĩ sẽ đồng hành cùng mình trong quãng đời sinh viên. Tìm thấy những đứa em vô cùng đáng yêu và tinh nghịch. Thiếu mọi người, có thể anh không làm được gì. Có thể nói, để có được những điều đó, chắc hẳn anh đã phải “tu 10 kiếp” mới gặp được. Và hơn tất cả, anh đã tìm thấy một đại gia đình mang tên Đoàn Khoa. Nơi đây không chỉ là một ngôi nhà ấm áp để trở về, mà còn là nơi thắp lên và giữ cho “ngọn lửa” nhiệt huyết của tuổi trẻ mãi mãi bùng cháy, để mỗi khi mỏi mệt, ta lại có một bến đỗ bình yên và biết rằng mình luôn có một đại gia đình để sẻ chia. Chào mừng các bạn đã về nhà! Hãy cùng nhau viết tiếp những trang sách thanh xuân thật rực rỡ nhé! 💙'
  },
  {
    name: 'TRẦN LÊ QUANG AN - Khóa K22',
    positions: ['Chủ nhiệm Chuyên san Tài chính và Công nghệ ứng dụng', 'Nguyên UV.BCH Đoàn Khoa', 'Thành viên Ban Tổ chức - Xây dựng Đoàn'],
    avatar: '/images/blog/quangan.jpg',
    avatarHint: 'quangan',
    comment: 'Hi các em, những người bạn nhỏ vừa đặt chân vào ngôi nhà chung Đoàn Khoa Tài chính - Ngân hàng. Ngày hôm nay, anh gửi lời chúc này không chỉ với tư cách của một người đi trước, mà còn là lời tâm sự từ trái tim một người từng gắn bó. Anh muốn các em biết rằng, hành trình ở Đoàn Khoa không chỉ là những ngày tháng làm việc, cống hiến, mà còn là một hành trình tìm thấy đam mê, chịu khó với những deadline gấp gáp, sự gắn bó và trân trọng những con người mình gặp gỡ, và tìm thấy giá trị của chính bản thân mình khi được sống hết mình với đam mê. Anh đã từng chứng kiến và cảm nhận được sự nhiệt huyết cháy bỏng trong từng ánh mắt các em, điều đó nhắc anh nhớ lại những năm tháng đầu tiên của mình. Anh tin rằng, chính ngọn lửa ấy sẽ đưa các em đi thật xa, vì vậy hãy cứ dấn thân, cứ dại khờ, cứ vấp ngã, rồi lại đứng lên mạnh mẽ. Sau tất cả, chính những kỷ niệm này sẽ làm nên một bản nhạc tuổi trẻ không bao giờ phai. Chúc các em sẽ có một hành trình thật đẹp, thật ý nghĩa và tìm thấy một phần thanh xuân rực rỡ nhất tại Đoàn khoa Tài chính - Ngân hàng 💙'
  },
];

export default function BlogPage() {
  return (
    <div>
      <PageBanner
        title="GÓC TÂM SỰ"
        subtitle='"Nơi những cảm xúc chân thật nhất được giải bày..."'
        imageUrl="/images/back-ocean.jpg"
        imageHint="community discussion"
      />

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Testimonials */}
            <h2 className="text-2xl md:text-4xl font-anton font-medium mb-8 text-primary text-center">ĐÔI LỜI GỬI GẮM TỪ CỰU THÀNH VIÊN</h2>
            <div className="space-y-8">
              {testimonials.map((testimonial, index) => (
                <ScrollReveal key={index} delayMs={60 * index}>
                  <Card className="overflow-hidden shadow-lg">
                    <CardContent className="p-6 flex flex-col gap-6">
                      <div className="flex flex-col items-center md:flex-row md:items-center gap-4">
                        <Avatar className="h-32 w-32 ml-5">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.avatarHint} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left">
                          <p className="font-medium font-anton text-2xl text-primary">{testimonial.name}</p>
                          <div className="mb-4 space-y-1 mt-4">
                            {(testimonial.positions ?? [testimonial.positions]).map((pos, i) => (
                              <p key={i} className="text-sm font-semibold text-muted-foreground">{pos}</p>
                            ))}
                          </div>
                        </div>
                        
                      </div>
                      <blockquote className="text-muted-foreground italic text-justify">{testimonial.comment}</blockquote>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          
          </div>

          {/* Fanpage Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <h3 className="text-2xl md:text-3xl text-center text-primary font-headline font-semibold">FANPAGE</h3>
              </CardHeader>
              <CardContent>
                <Image
                  src="/images/banner.jpg"
                  alt="Fanpage preview"
                  width={400}
                  height={250}
                  className="rounded-lg mb-4 center"
                  data-ai-hint="social media page"
                />
                <p className="text-muted-foreground mb-4">
                  Hãy theo dõi fanpage của chúng tớ để cập nhật những thông tin mới nhất về các hoạt động của Khoa, Trường nhaa.
                </p>
                <Button asChild className="w-full">
                  <Link href="https://www.facebook.com/tcnh.uel" target="_blank" rel="noopener noreferrer">Ghé thăm Fanpage</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      <div className="container mx-auto px-9 text-center">
        <h2 style={{ color: "#45973c" }} className="text-3xl md:text-5xl font-anton font-medium text-primary mt-0 md:mt-0">TUYỂN CỘNG TÁC VIÊN</h2>
          <Image
              src="/images/back-bia.jpg"
              alt="Extra illustration"
              width={800}
              height={400}
              className="mt-6 md:mt-10 w-auto h-auto rounded-xl shadow-2xl object-cover mx-auto"
          />
          <div className="mt-6">
              <Link href="/apply">
              <Button className="bg-[#45973c] hover:bg-[#357a2e] text-white mb-20 px-6 py-6 text-lg font-semibold">
                  ỨNG TUYỂN NGAY
              </Button>
              </Link>
          </div>
      </div>S
    </div>
  );
}
