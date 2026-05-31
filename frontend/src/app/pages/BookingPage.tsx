import { useState } from 'react';
import { Link } from '../components/Link';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

const trainers = [
  {
    id: 1,
    name: 'Trần Minh Quân',
    specialty: 'Strength & Conditioning',
    experience: '8 năm',
    rating: 4.9,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400',
    available: true,
  },
  {
    id: 2,
    name: 'Nguyễn Thị Hương',
    specialty: 'Weight Loss & Nutrition',
    experience: '6 năm',
    rating: 5.0,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1571732154690-f6d1c3e5178a?w=400',
    available: true,
  },
  {
    id: 3,
    name: 'Lê Văn Tuấn',
    specialty: 'Bodybuilding & Hypertrophy',
    experience: '10 năm',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=400',
    available: false,
  },
];

const services = [
  { id: 1, name: 'Personal Training', duration: '60 phút', price: '500.000đ' },
  { id: 2, name: 'Body Transformation', duration: '90 phút', price: '750.000đ' },
  { id: 3, name: 'Nutrition Consultation', duration: '45 phút', price: '400.000đ' },
  { id: 4, name: 'Rehab Training', duration: '60 phút', price: '600.000đ' },
];

const timeSlots = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00',
];

export function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    goal: '',
    health: '',
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTrainer !== null;
      case 2:
        return selectedService !== null;
      case 3:
        return selectedDate && selectedTime;
      case 4:
        return formData.name && formData.phone && formData.goal;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback src={logoImage} alt="Renfit" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/ai-coach"
              className="text-white/70 hover:text-[#0F6B3E] transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Chat với AI Coach
            </Link>
            <Link
              to="/dashboard"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    s <= step
                      ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white'
                      : 'bg-transparent border-white/20 text-white/40'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 5 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${s < step ? 'bg-[#0F6B3E]' : 'bg-white/20'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={step >= 1 ? 'text-white' : 'text-white/40'}>Chọn HLV</span>
            <span className={step >= 2 ? 'text-white' : 'text-white/40'}>Chọn Dịch Vụ</span>
            <span className={step >= 3 ? 'text-white' : 'text-white/40'}>Chọn Thời Gian</span>
            <span className={step >= 4 ? 'text-white' : 'text-white/40'}>Thông Tin</span>
            <span className={step >= 5 ? 'text-white' : 'text-white/40'}>Xác Nhận</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Step 1: Select Coach */}
        {step === 1 && (
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">Chọn Huấn Luyện Viên</h1>
            <p className="text-white/60 mb-8">Chọn HLV phù hợp với mục tiêu của bạn</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainers.map((trainer) => (
                <button
                  key={trainer.id}
                  onClick={() => setSelectedTrainer(trainer.id)}
                  disabled={!trainer.available}
                  className={`text-left rounded-3xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                    selectedTrainer === trainer.id
                      ? 'border-[#0F6B3E] shadow-[0_0_40px_rgba(15,107,62,0.3)]'
                      : 'border-white/10 hover:border-[#0F6B3E]/50'
                  } ${!trainer.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="relative h-80">
                    <ImageWithFallback
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    {!trainer.available && (
                      <div className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm">
                        Không có lịch
                      </div>
                    )}
                    {selectedTrainer === trainer.id && (
                      <div className="absolute top-4 left-4 bg-[#0F6B3E] text-white p-2 rounded-full">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-white/5 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-2">{trainer.name}</h3>
                    <p className="text-[#0F6B3E] mb-2">{trainer.specialty}</p>
                    <p className="text-white/60 text-sm mb-3">Kinh nghiệm: {trainer.experience}</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-[#0F6B3E] text-[#0F6B3E]" />
                      <span className="text-white">{trainer.rating}</span>
                      <span className="text-white/40 text-sm">({trainer.reviews} đánh giá)</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Service */}
        {step === 2 && (
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">Chọn Dịch Vụ</h1>
            <p className="text-white/60 mb-8">Chọn loại hình tập luyện bạn muốn</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`text-left p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedService === service.id
                      ? 'border-[#0F6B3E] bg-[#0F6B3E]/10 shadow-[0_0_40px_rgba(15,107,62,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-[#0F6B3E]/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">{service.name}</h3>
                    {selectedService === service.id && (
                      <div className="bg-[#0F6B3E] text-white p-2 rounded-full">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-white/60 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                    <div className="text-[#0F6B3E] font-bold text-xl">{service.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">Chọn Ngày & Giờ</h1>
            <p className="text-white/60 mb-8">Chọn thời gian phù hợp với lịch của bạn</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Picker */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0F6B3E]" />
                  Chọn Ngày
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#0F6B3E] transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time Slots */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0F6B3E]" />
                  Chọn Giờ
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-xl border transition-all duration-300 ${
                        selectedTime === time
                          ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white'
                          : 'bg-white/5 border-white/10 text-white hover:border-[#0F6B3E]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Customer Information */}
        {step === 4 && (
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">Thông Tin Của Bạn</h1>
            <p className="text-white/60 mb-8">Vui lòng cung cấp thông tin để hoàn tất đặt lịch</p>
            <div className="max-w-3xl bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <div className="space-y-6">
                <div>
                  <label className="text-white mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0F6B3E]" />
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#0F6B3E] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#0F6B3E]" />
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0123 456 789"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#0F6B3E] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0F6B3E]" />
                    Email (Tùy chọn)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#0F6B3E] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white mb-2">Mục Tiêu Tập Luyện</label>
                  <textarea
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    placeholder="Ví dụ: Giảm cân, tăng cơ, cải thiện sức khỏe..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#0F6B3E] transition-colors resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-white mb-2">Tình Trạng Sức Khỏe (Tùy chọn)</label>
                  <textarea
                    value={formData.health}
                    onChange={(e) => setFormData({ ...formData, health: e.target.value })}
                    placeholder="Có vấn đề sức khỏe nào cần lưu ý không?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#0F6B3E] transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <div className="w-20 h-20 rounded-full bg-[#0F6B3E] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Đặt Lịch Thành Công!</h1>
              <p className="text-white/70 text-lg mb-8">
                Cảm ơn bạn đã tin tưởng Renfit. Chúng tôi đã gửi xác nhận qua SMS.
              </p>

              {/* Booking Summary */}
              <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
                <h3 className="text-xl font-bold text-white mb-4">Thông Tin Đặt Lịch</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Huấn luyện viên:</span>
                    <span className="text-white font-medium">
                      {trainers.find((t) => t.id === selectedTrainer)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Dịch vụ:</span>
                    <span className="text-white font-medium">
                      {services.find((s) => s.id === selectedService)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Ngày:</span>
                    <span className="text-white font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Giờ:</span>
                    <span className="text-white font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="text-white/60">Tổng chi phí:</span>
                    <span className="text-[#0F6B3E] font-bold text-xl">
                      {services.find((s) => s.id === selectedService)?.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white rounded-2xl p-6 mb-8">
                <div className="w-48 h-48 bg-gray-200 mx-auto rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">QR Code</span>
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  Xuất trình mã này khi đến phòng gym
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Link
                  to="/dashboard"
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-full transition-colors"
                >
                  Về Dashboard
                </Link>
                <Link
                  to="/ai-coach"
                  className="flex-1 bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)] flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat Với Coach
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex gap-4 mt-12">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay Lại
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`ml-auto px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-2 ${
                canProceed()
                  ? 'bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(15,107,62,0.5)]'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {step === 4 ? 'Xác Nhận Đặt Lịch' : 'Tiếp Theo'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
