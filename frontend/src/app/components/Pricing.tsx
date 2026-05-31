import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '2.500.000',
    period: '/tháng',
    description: 'Phù hợp cho người mới bắt đầu',
    features: [
      'Truy cập gym không giới hạn',
      '2 buổi PT/tháng',
      'Tư vấn dinh dưỡng cơ bản',
      'Truy cập AI Coach',
      'Đo lường thể chất hàng tháng',
    ],
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '4.500.000',
    period: '/tháng',
    description: 'Lựa chọn phổ biến nhất',
    features: [
      'Mọi quyền lợi của Basic',
      '8 buổi PT/tháng',
      'Kế hoạch dinh dưỡng chi tiết',
      'Ưu tiên đặt lịch',
      'Theo dõi tiến trình chi tiết',
      'Tư vấn phục hồi chấn thương',
      'Tham gia các workshop',
    ],
    highlighted: true,
  },
  {
    name: 'Elite',
    price: '8.000.000',
    period: '/tháng',
    description: 'Trải nghiệm cao cấp nhất',
    features: [
      'Mọi quyền lợi của Premium',
      'PT riêng không giới hạn',
      'Huấn luyện viên cá nhân',
      'Phòng tập riêng biệt',
      'Chế độ dinh dưỡng VIP',
      'Massage phục hồi',
      'Tư vấn 24/7',
      'Ưu đãi đặc biệt',
    ],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0F6B3E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0F6B3E]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Gói <span className="text-[#0F6B3E]">Thành Viên</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Lựa chọn gói phù hợp với mục tiêu và ngân sách của bạn.
            Tất cả gói đều có cam kết chất lượng.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 border transition-all duration-300 hover:scale-105 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-[#0F6B3E]/20 to-[#0F6B3E]/5 border-[#0F6B3E] shadow-[0_0_50px_rgba(15,107,62,0.3)]'
                  : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#0F6B3E]/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0F6B3E] text-white px-6 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  Phổ Biến Nhất
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-xl text-white/60 mb-2">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#0F6B3E] flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-4 rounded-full transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white shadow-[0_0_20px_rgba(15,107,62,0.5)]'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                Chọn Gói {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-white/60 mb-4">
            Tất cả gói đều có thể hủy bất kỳ lúc nào. Không ràng buộc dài hạn.
          </p>
          <button className="text-[#0F6B3E] hover:text-[#0F6B3E]/80 underline transition-colors">
            So sánh chi tiết các gói
          </button>
        </div>
      </div>
    </section>
  );
}
