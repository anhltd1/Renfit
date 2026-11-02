import {
  Dumbbell,
  Bot,
  Apple,
  TrendingUp,
  Scale,
  Flame,
  Heart,
  Target,
  Zap,
  Award,
  Users,
  Star,
  Activity,
  Bike,
  Timer,
  Mountain,
  Salad,
  Footprints,
  Brain,
  Shield,
  Gauge,
  Waves,
  Sunrise,
  Leaf,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface IconEntry {
  name: string;
  icon: LucideIcon;
  label: string;
}

export const ICON_ALLOWLIST: IconEntry[] = [
  { name: 'Dumbbell', icon: Dumbbell, label: 'Tạ' },
  { name: 'Bot', icon: Bot, label: 'Robot' },
  { name: 'Apple', icon: Apple, label: 'Táo' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Xu hướng' },
  { name: 'Scale', icon: Scale, label: 'Cân' },
  { name: 'Flame', icon: Flame, label: 'Lửa' },
  { name: 'Heart', icon: Heart, label: 'Tim' },
  { name: 'Target', icon: Target, label: 'Mục tiêu' },
  { name: 'Zap', icon: Zap, label: 'Sấm sét' },
  { name: 'Award', icon: Award, label: 'Giải thưởng' },
  { name: 'Users', icon: Users, label: 'Nhóm' },
  { name: 'Star', icon: Star, label: 'Ngôi sao' },
  { name: 'Activity', icon: Activity, label: 'Hoạt động' },
  { name: 'Bike', icon: Bike, label: 'Xe đạp' },
  { name: 'Timer', icon: Timer, label: 'Đồng hồ' },
  { name: 'Mountain', icon: Mountain, label: 'Núi' },
  { name: 'Salad', icon: Salad, label: 'Salad' },
  { name: 'Footprints', icon: Footprints, label: 'Bước chân' },
  { name: 'Brain', icon: Brain, label: 'Não' },
  { name: 'Shield', icon: Shield, label: 'Khiên' },
  { name: 'Gauge', icon: Gauge, label: 'Đồng hồ đo' },
  { name: 'Waves', icon: Waves, label: 'Sóng' },
  { name: 'Sunrise', icon: Sunrise, label: 'Bình minh' },
  { name: 'Leaf', icon: Leaf, label: 'Lá' },
];

/** Map for O(1) lookup by name */
export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_ALLOWLIST.map((e) => [e.name, e.icon]),
);

/** Resolve an icon name to a component, or null if not in allowlist. */
export function resolveIcon(name: string | undefined | null): LucideIcon | null {
  if (!name) return null;
  return Object.hasOwn(ICON_MAP, name) ? ICON_MAP[name] : null;
}
