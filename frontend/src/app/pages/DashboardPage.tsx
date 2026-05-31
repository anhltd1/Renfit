import { Link } from '../components/Link';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import {
  Home,
  MessageSquare,
  Calendar,
  TrendingUp,
  Activity,
  Flame,
  Target,
  Award,
  Clock,
  Dumbbell,
  Apple,
  User,
  Bell,
  ChevronRight,
} from 'lucide-react';

const upcomingAppointments = [
  {
    trainer: 'Trần Minh Quân',
    service: 'Personal Training',
    date: '28/05/2026',
    time: '16:00',
    status: 'confirmed',
  },
  {
    trainer: 'Nguyễn Thị Hương',
    service: 'Nutrition Consultation',
    date: '30/05/2026',
    time: '14:00',
    status: 'confirmed',
  },
];

const weeklyProgress = [
  { day: 'T2', calories: 2400 },
  { day: 'T3', calories: 2200 },
  { day: 'T4', calories: 2600 },
  { day: 'T5', calories: 2300 },
  { day: 'T6', calories: 2500 },
  { day: 'T7', calories: 1900 },
  { day: 'CN', calories: 2100 },
];

const aiRecommendations = [
  {
    icon: Dumbbell,
    title: 'Tập Chân Hôm Nay',
    description: 'Đã 5 ngày kể từ buổi tập chân cuối. Tập ngay!',
    action: 'Xem Bài Tập',
  },
  {
    icon: Apple,
    title: 'Tăng Protein',
    description: 'Bạn thiếu 30g protein trong tuần này.',
    action: 'Xem Thực Đơn',
  },
  {
    icon: Activity,
    title: 'Mục Tiêu Gần Đạt',
    description: 'Còn 2kg nữa để đạt mục tiêu. Cố lên!',
    action: 'Xem Chi Tiết',
  },
];

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] flex">
      {/* Sidebar */}
      <div className="w-80 bg-black border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback src={logoImage} alt="Renfit" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 text-[#0F6B3E] bg-[#0F6B3E]/20 px-4 py-3 rounded-xl"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/ai-coach"
            className="flex items-center gap-3 text-white/70 hover:text-[#0F6B3E] hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            AI Coach
          </Link>
          <Link
            to="/booking"
            className="flex items-center gap-3 text-white/70 hover:text-[#0F6B3E] hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
          >
            <Calendar className="w-5 h-5" />
            Đặt Lịch
          </Link>
          <button className="w-full flex items-center gap-3 text-white/70 hover:text-[#0F6B3E] hover:bg-white/5 px-4 py-3 rounded-xl transition-all">
            <Apple className="w-5 h-5" />
            Thực Đơn
          </button>
          <button className="w-full flex items-center gap-3 text-white/70 hover:text-[#0F6B3E] hover:bg-white/5 px-4 py-3 rounded-xl transition-all">
            <Dumbbell className="w-5 h-5" />
            Lịch Tập
          </button>
          <button className="w-full flex items-center gap-3 text-white/70 hover:text-[#0F6B3E] hover:bg-white/5 px-4 py-3 rounded-xl transition-all">
            <TrendingUp className="w-5 h-5" />
            Tiến Trình
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-[#0F6B3E] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white text-sm">Nguyễn Văn An</div>
              <div className="text-white/40 text-xs">Member Premium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-black/80 backdrop-blur-md border-b border-white/10 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Chào Buổi Chiều, An!</h1>
              <p className="text-white/60">Hôm nay bạn đã tập chưa?</p>
            </div>
            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#0F6B3E]/20 to-[#0F6B3E]/5 backdrop-blur-sm rounded-3xl p-6 border border-[#0F6B3E]/30">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 text-[#0F6B3E]" />
                <span className="text-[#0F6B3E] text-sm">Tuần này</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">15,420</div>
              <div className="text-white/60 text-sm">Calories Đã Đốt</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <Dumbbell className="w-8 h-8 text-white/60" />
                <span className="text-white/40 text-sm">Tuần này</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">5</div>
              <div className="text-white/60 text-sm">Buổi Tập</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-white/60" />
                <span className="text-white/40 text-sm">Tiến độ</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">73kg</div>
              <div className="text-white/60 text-sm">Cân Nặng Hiện Tại</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-white/60" />
                <span className="text-white/40 text-sm">Thành tựu</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">28</div>
              <div className="text-white/60 text-sm">Ngày Liên Tiếp</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Weekly Progress Chart */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Tiến Trình Tuần Này</h2>
                <div className="flex items-end justify-between h-64 gap-4">
                  {weeklyProgress.map((day, index) => {
                    const maxCalories = Math.max(...weeklyProgress.map((d) => d.calories));
                    const height = (day.calories / maxCalories) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-3">
                        <div className="w-full bg-white/10 rounded-t-xl relative overflow-hidden" style={{ height: `${height}%` }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F6B3E] to-[#0F6B3E]/60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{day.calories}</span>
                          </div>
                        </div>
                        <span className="text-white/60 text-sm">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-[#0F6B3E]" />
                  Gợi Ý Từ AI Coach
                </h2>
                <div className="space-y-4">
                  {aiRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#0F6B3E]/50 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0F6B3E]/20 flex items-center justify-center flex-shrink-0">
                          <rec.icon className="w-6 h-6 text-[#0F6B3E]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-1">{rec.title}</h3>
                          <p className="text-white/60 text-sm mb-3">{rec.description}</p>
                          <button className="text-[#0F6B3E] text-sm hover:underline flex items-center gap-1">
                            {rec.action}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Upcoming Appointments */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-[#0F6B3E]" />
                  Lịch Hẹn Sắp Tới
                </h2>
                <div className="space-y-4">
                  {upcomingAppointments.map((apt, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-[#0F6B3E]" />
                        <span className="text-white text-sm font-medium">
                          {apt.date} • {apt.time}
                        </span>
                      </div>
                      <h3 className="text-white font-bold mb-1">{apt.service}</h3>
                      <p className="text-white/60 text-sm mb-3">HLV: {apt.trainer}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-green-400 text-xs">Đã Xác Nhận</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/booking"
                  className="mt-6 w-full bg-[#0F6B3E]/20 hover:bg-[#0F6B3E]/30 text-[#0F6B3E] py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Đặt Lịch Mới
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Thao Tác Nhanh</h2>
                <div className="space-y-3">
                  <Link
                    to="/ai-coach"
                    className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 text-white py-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat AI Coach
                  </Link>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Dumbbell className="w-5 h-5" />
                    Bắt Đầu Tập
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Apple className="w-5 h-5" />
                    Ghi Nhận Bữa Ăn
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
