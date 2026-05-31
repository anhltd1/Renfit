import { Dumbbell, Bot, Apple, TrendingUp, Scale, Flame } from 'lucide-react';

const services = [
  {
    icon: Dumbbell,
    title: 'Personal Training',
    description: 'Huấn luyện viên cá nhân 1-1 với chương trình được thiết kế riêng cho bạn.',
  },
  {
    icon: Bot,
    title: 'AI Fitness Coach',
    description: 'Trợ lý AI thông minh hỗ trợ bạn 24/7, trả lời mọi câu hỏi về tập luyện.',
  },
  {
    icon: Apple,
    title: 'Tư Vấn Dinh Dưỡng',
    description: 'Chế độ ăn uống khoa học, cân đối dinh dưỡng phù hợp với mục tiêu.',
  },
  {
    icon: TrendingUp,
    title: 'Strength & Conditioning',
    description: 'Xây dựng sức mạnh và thể lực toàn diện với bài tập chuyên sâu.',
  },
  {
    icon: Scale,
    title: 'Giảm Cân',
    description: 'Chương trình giảm cân khoa học, an toàn và hiệu quả lâu dài.',
  },
  {
    icon: Flame,
    title: 'Tăng Cơ',
    description: 'Phát triển khối lượng cơ bắp với phương pháp tập luyện tối ưu.',
  },
];

export function Services() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0B0B0B] to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Dịch Vụ <span className="text-[#0F6B3E]">Của Chúng Tôi</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Giải pháp tập luyện toàn diện với sự kết hợp của công nghệ và chuyên môn.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#0F6B3E] transition-all duration-300 hover:shadow-[0_0_40px_rgba(15,107,62,0.3)] hover:scale-105"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#0F6B3E]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#0F6B3E]/20 flex items-center justify-center mb-6 group-hover:bg-[#0F6B3E]/30 transition-colors duration-300">
                  <service.icon className="w-8 h-8 text-[#0F6B3E]" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#0F6B3E] transition-colors duration-300">
                  {service.title}
                </h3>

                <p className="text-white/70 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#0F6B3E]/20 to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
