import { Link } from './Link';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { Dumbbell, Users, Star } from 'lucide-react';
import { getAuthUser } from '../../lib/auth';

export function Hero() {
  const user = getAuthUser();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Luxury gym equipment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[#0B0B0B]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F6B3E]/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <ImageWithFallback
            src={logoImage}
            alt="Renfit Logo"
            className="h-24 w-auto"
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="text-white">Nâng Tầm Thể Chất.</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#0F6B3E]">
            Kiến Tạo Phiên Bản
          </span>
          <br />
          <span className="text-[#0F6B3E]">Tốt Nhất Của Bạn.</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
          Phòng gym riêng tư cao cấp với huấn luyện viên cá nhân chuyên nghiệp,
          hỗ trợ AI thông minh và chương trình tập luyện được cá nhân hóa hoàn toàn.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link
            to={user ? '/dashboard' : '/booking'}
            className="px-8 py-4 bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)] text-center"
          >
            {user ? 'Vào Dashboard' : 'Đặt Lịch Tư Vấn'}
          </Link>
          <Link
            to={user ? '/dashboard' : '/ai-coach'}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 text-center"
          >
            {user ? `Xin chào, ${user.id}` : 'Chat Với AI Coach'}
          </Link>
        </div>

        {/* Floating Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.3)]">
            <div className="flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-[#0F6B3E]" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">100+</div>
            <div className="text-white/60">Hội viên</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.3)]">
            <div className="flex items-center justify-center mb-3">
              <Dumbbell className="w-8 h-8 text-[#0F6B3E]" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">10+</div>
            <div className="text-white/60">Huấn luyện viên</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.3)]">
            <div className="flex items-center justify-center mb-3">
              <Star className="w-8 h-8 text-[#0F6B3E]" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">95%</div>
            <div className="text-white/60">Khách hàng hài lòng</div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0B] to-transparent z-10" />
    </section>
  );
}
