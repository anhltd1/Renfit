import { Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const testimonials = [
  {
    name: 'Nguyễn Văn An',
    age: 32,
    achievement: 'Giảm 15kg trong 4 tháng',
    comment: 'Renfit đã thay đổi cuộc sống của tôi hoàn toàn. Đội ngũ HLV chuyên nghiệp, tận tâm và luôn động viên tôi. Không gian tập riêng tư giúp tôi tập trung hơn.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    name: 'Trần Thị Mai',
    age: 28,
    achievement: 'Tăng 8kg cơ trong 6 tháng',
    comment: 'Chương trình tập luyện được cá nhân hóa hoàn toàn phù hợp với mục tiêu của tôi. AI Coach cũng rất hữu ích, trả lời mọi thắc mắc ngay lập tức.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    name: 'Lê Minh Tuấn',
    age: 35,
    achievement: 'Cải thiện sức khỏe và thể lực',
    comment: 'Sau 3 tháng tập tại Renfit, tôi cảm thấy khỏe khoắn, tràn đầy năng lượng. Thiết bị hiện đại, HLV nhiệt tình, môi trường sạch sẽ. Rất đáng để đầu tư!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
  {
    name: 'Phạm Thu Hà',
    age: 26,
    achievement: 'Xây dựng thói quen tập luyện',
    comment: 'Trước đây tôi rất ngại đến gym, nhưng không gian riêng tư ở Renfit khiến tôi tự tin hơn. Giờ tôi tập 5 buổi/tuần và yêu thích nó!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0B0B0B] to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Khách Hàng <span className="text-[#0F6B3E]">Nói Gì</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Câu chuyện thành công từ những người đã thay đổi cuộc sống cùng Renfit.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.2)]"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <ImageWithFallback
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#0F6B3E]"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white">{testimonial.name}</h4>
                  <p className="text-white/60 text-sm">{testimonial.age} tuổi</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#0F6B3E] text-[#0F6B3E]" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 rounded-2xl px-4 py-3 mb-4">
                <p className="text-[#0F6B3E] text-center">
                  {testimonial.achievement}
                </p>
              </div>

              {/* Comment */}
              <p className="text-white/80 leading-relaxed italic">
                "{testimonial.comment}"
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-5xl font-bold text-[#0F6B3E] mb-2">95%</div>
            <p className="text-white/70">Khách hàng hài lòng</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-[#0F6B3E] mb-2">12kg</div>
            <p className="text-white/70">Giảm cân trung bình</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-[#0F6B3E] mb-2">3 tháng</div>
            <p className="text-white/70">Thời gian đạt mục tiêu</p>
          </div>
        </div>
      </div>
    </section>
  );
}
