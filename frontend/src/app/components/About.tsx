import { ImageWithFallback } from './figma/ImageWithFallback';
import { Target, Award, Heart, Zap } from 'lucide-react';

export function About() {
  return (
    <section className="py-24 px-6 bg-[#0B0B0B]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Về <span className="text-[#0F6B3E]">Renfit</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Không gian tập luyện cao cấp với môi trường riêng tư,
            trang thiết bị hiện đại và đội ngũ huấn luyện viên chuyên nghiệp.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Image Card - Spans 2 columns */}
          <div className="lg:col-span-2 lg:row-span-2 relative rounded-3xl overflow-hidden group">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1637430308606-86576d8fef3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Luxury gym equipment"
              className="w-full h-full object-cover min-h-[400px] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-3xl font-bold text-white mb-3">
                Không Gian Tập Luyện Đẳng Cấp
              </h3>
              <p className="text-white/80 text-lg">
                Thiết bị cao cấp từ các thương hiệu hàng đầu thế giới,
                đáp ứng mọi nhu cầu tập luyện của bạn.
              </p>
            </div>
          </div>

          {/* Feature Card 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(15,107,62,0.2)]">
            <Target className="w-12 h-12 text-[#0F6B3E] mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Mục Tiêu Cá Nhân</h3>
            <p className="text-white/70">
              Chương trình tập luyện được thiết kế riêng dựa trên mục tiêu và thể trạng của bạn.
            </p>
          </div>

          {/* Coaching Image */}
          <div className="relative rounded-3xl overflow-hidden group">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1584466977773-e625c37cdd50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Personal training session"
              className="w-full h-full object-cover min-h-[280px] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h4 className="text-xl font-bold text-white">
                Huấn Luyện 1-1
              </h4>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(15,107,62,0.2)]">
            <Award className="w-12 h-12 text-[#0F6B3E] mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Huấn Luyện Viên Chuyên Nghiệp</h3>
            <p className="text-white/70">
              Đội ngũ HLV được chứng nhận quốc tế với kinh nghiệm nhiều năm.
            </p>
          </div>

          {/* Recovery Area Image */}
          <div className="relative rounded-3xl overflow-hidden group">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1770026137145-e792e19b9060?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Athlete training"
              className="w-full h-full object-cover min-h-[280px] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h4 className="text-xl font-bold text-white">
                Phục Hồi & Hồi Phục
              </h4>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(15,107,62,0.2)]">
            <Heart className="w-12 h-12 text-[#0F6B3E] mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Theo Dõi Sức Khỏe</h3>
            <p className="text-white/70">
              Giám sát tiến trình và sức khỏe toàn diện với công nghệ hiện đại.
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(15,107,62,0.2)]">
            <Zap className="w-12 h-12 text-[#0F6B3E] mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Kết Quả Nhanh Chóng</h3>
            <p className="text-white/70">
              Phương pháp khoa học giúp bạn đạt mục tiêu trong thời gian ngắn nhất.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
