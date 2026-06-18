import { Link } from './Link';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const coaches = [
  { name: 'Trần Minh Quân', specialty: 'Strength Training', experience: '8 năm', image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400' },
  { name: 'Nguyễn Thị Hương', specialty: 'Weight Loss', experience: '6 năm', image: 'https://images.unsplash.com/photo-1571732154690-f6d1c3e5178a?w=400' },
  { name: 'Lê Văn Tuấn', specialty: 'Muscle Building', experience: '10 năm', image: 'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=400' },
];

export function Booking() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-black to-[#0B0B0B]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Đặt Lịch <span className="text-[#0F6B3E]">Tập Luyện</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Chọn huấn luyện viên, thời gian phù hợp và bắt đầu hành trình thay đổi của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h3 className="text-3xl font-bold text-white mb-8">Thông Tin Đặt Lịch</h3>

            {/* Coach Selection */}
            <div className="mb-6">
              <label className="text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0F6B3E]" />
                Chọn Huấn Luyện Viên
              </label>
              <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#0F6B3E] transition-colors">
                <option value="">-- Chọn HLV --</option>
                {coaches.map((coach, index) => (
                  <option key={index} value={coach.name}>
                    {coach.name} - {coach.specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="mb-6">
              <label className="text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0F6B3E]" />
                Chọn Ngày
              </label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#0F6B3E] transition-colors"
              />
            </div>

            {/* Time Slots */}
            <div className="mb-8">
              <label className="text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0F6B3E]" />
                Chọn Giờ
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['07:00', '09:00', '11:00', '14:00', '16:00', '18:00', '20:00'].map((time) => (
                  <button
                    key={time}
                    className="bg-white/5 hover:bg-[#0F6B3E] border border-white/10 hover:border-[#0F6B3E] rounded-xl px-4 py-3 text-white transition-all duration-300 hover:scale-105"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking CTA */}
            <Link
              to="/dashboard"
              className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)] flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Đặt Lịch Ngay
            </Link>
          </div>

          {/* Coach Cards */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white mb-6">Huấn Luyện Viên</h3>
            {coaches.map((coach, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:scale-105 flex items-center gap-6"
              >
                <ImageWithFallback
                  src={coach.image}
                  alt={coach.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-2">{coach.name}</h4>
                  <p className="text-[#0F6B3E] mb-1">{coach.specialty}</p>
                  <p className="text-white/60 text-sm">Kinh nghiệm: {coach.experience}</p>
                </div>
                <button className="bg-[#0F6B3E]/20 hover:bg-[#0F6B3E] text-[#0F6B3E] hover:text-white px-6 py-2 rounded-full transition-colors duration-300">
                  Chọn
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
