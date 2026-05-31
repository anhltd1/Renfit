import { ImageWithFallback } from './figma/ImageWithFallback';
import { Award } from 'lucide-react';

const trainers = [
  {
    name: 'Trần Minh Quân',
    specialty: 'Strength & Conditioning',
    experience: '8 năm kinh nghiệm',
    image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400',
    certifications: 'NASM-CPT, CSCS',
  },
  {
    name: 'Nguyễn Thị Hương',
    specialty: 'Weight Loss & Nutrition',
    experience: '6 năm kinh nghiệm',
    image: 'https://images.unsplash.com/photo-1571732154690-f6d1c3e5178a?w=400',
    certifications: 'ACE-CPT, PN-1',
  },
  {
    name: 'Lê Văn Tuấn',
    specialty: 'Bodybuilding & Hypertrophy',
    experience: '10 năm kinh nghiệm',
    image: 'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=400',
    certifications: 'ISSA-CPT, IFBB Pro',
  },
  {
    name: 'Phạm Thu Trang',
    specialty: 'Functional Training',
    experience: '5 năm kinh nghiệm',
    image: 'https://images.unsplash.com/photo-1548542031-0b26d8ba1e0a?w=400',
    certifications: 'NASM-CPT, TRX',
  },
];

export function Trainers() {
  return (
    <section className="py-24 px-6 bg-[#0B0B0B]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Đội Ngũ <span className="text-[#0F6B3E]">Huấn Luyện Viên</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Các chuyên gia được chứng nhận quốc tế, sẵn sàng đồng hành
            cùng bạn trên con đường chinh phục mục tiêu.
          </p>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trainers.map((trainer, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card Container */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-[#0F6B3E] transition-all duration-300 hover:shadow-[0_0_40px_rgba(15,107,62,0.3)] hover:scale-105">
                {/* Image */}
                <div className="relative h-80 overflow-hidden">
                  <ImageWithFallback
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                  {/* Certification Badge */}
                  <div className="absolute top-4 right-4 bg-[#0F6B3E]/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-white text-xs">Chứng Chỉ</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#0F6B3E] transition-colors">
                    {trainer.name}
                  </h3>
                  <p className="text-[#0F6B3E] mb-2">{trainer.specialty}</p>
                  <p className="text-white/60 text-sm mb-3">{trainer.experience}</p>
                  <div className="flex flex-wrap gap-2">
                    {trainer.certifications.split(', ').map((cert, idx) => (
                      <span
                        key={idx}
                        className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)]">
            Tìm Hiểu Thêm Về Đội Ngũ HLV
          </button>
        </div>
      </div>
    </section>
  );
}
