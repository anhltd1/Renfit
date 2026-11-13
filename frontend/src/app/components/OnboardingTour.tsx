/**
 * First-run onboarding guide for brand-new accounts (triggered once via
 * lib/auth.ts's consumeNewAccountFlag — set right after signup, never on a
 * normal login). Walks through the overall dashboard UI, the booking
 * management system, and the Profile/InBody section.
 *
 * Implementation: a spotlight overlay that highlights a real DOM element
 * (found via `data-tour="<key>"` attributes already placed on the actual
 * sidebar/header/section markup) plus a callout tooltip with a step counter,
 * Back/Next, and a Skip button. Steps with no target render as a centered
 * welcome/finish card instead.
 *
 * Generalized in U4 (Trainee Mobile) to accept an optional `steps`/`onTabChange`
 * pair so the mobile shell can supply its own steps (targeting
 * `data-tour="mobile-tab-*"` bottom-tab anchors instead of the desktop
 * sidebar) while reusing this component's spotlight-positioning engine
 * as-is. When `steps` is omitted, the original desktop DESKTOP_STEPS/
 * `OnboardingTab` behavior is unchanged — existing desktop call sites need
 * no changes.
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import logoImage from '../../imports/image.png';

export type OnboardingTab = 'overview' | 'chat' | 'bookings';

export interface OnboardingStep<Tab extends string = OnboardingTab> {
  /** data-tour value of the element to spotlight; omit for a centered card (welcome/finish). */
  target?: string;
  /** Tab to switch to before measuring the target. */
  tab?: Tab;
  title: string;
  description: string;
  placement?: 'top' | 'bottom';
}

const DESKTOP_STEPS: OnboardingStep[] = [
  {
    title: 'Chào mừng đến với Renfit',
    description:
      'Cảm ơn bạn đã đăng ký. Hãy dành 1 phút để mình hướng dẫn nhanh các khu vực chính trong ứng dụng nhé.',
  },
  {
    target: 'sidebar-profile',
    tab: 'overview',
    title: 'Hồ sơ & InBody',
    description:
      'Đây là nơi bạn xem và cập nhật thông tin cá nhân, cũng như theo dõi chỉ số InBody theo thời gian.',
  },
  {
    target: 'sidebar-chat',
    tab: 'overview',
    title: 'AI Coach',
    description:
      'Trò chuyện với AI Coach để được tư vấn tập luyện, xem tiến độ, hoặc đặt lịch tập ngay trong khung chat.',
  },
  {
    target: 'sidebar-bookings',
    tab: 'overview',
    title: 'Đặt lịch tập',
    description: 'Xem khung giờ còn trống và quản lý lịch tập của bạn tại đây.',
  },
  {
    target: 'header-notifications',
    tab: 'overview',
    title: 'Thông báo',
    description:
      'Bạn sẽ nhận thông báo khi lịch tập được xác nhận, sắp đến giờ tập, hoặc khi HLV cập nhật chỉ số InBody mới.',
  },
  {
    target: 'profile-form',
    tab: 'overview',
    title: 'Cập nhật hồ sơ cá nhân',
    description:
      'Điền mục tiêu tập luyện, tình trạng sức khỏe, chiều cao và cân nặng — thông tin này giúp HLV và AI Coach tư vấn chính xác hơn cho bạn.',
    placement: 'top',
  },
  {
    target: 'inbody-section',
    tab: 'overview',
    title: 'Theo dõi chỉ số InBody',
    description:
      'Sau mỗi lần đo tại phòng gym, huấn luyện viên sẽ cập nhật chỉ số InBody của bạn ở đây — biểu đồ giúp bạn thấy rõ tiến bộ theo thời gian.',
    placement: 'top',
  },
  {
    target: 'booking-calendar',
    tab: 'bookings',
    title: 'Quản lý lịch tập',
    description:
      'Chọn một khung giờ còn trống để đặt lịch. Lịch mới sẽ ở trạng thái "Chờ duyệt" cho đến khi HLV xác nhận — bạn cũng có thể nhấn vào lịch đã đặt để hủy.',
    placement: 'top',
  },
  {
    title: 'Vậy là xong',
    description:
      'Bạn đã sẵn sàng bắt đầu hành trình với Renfit. Bạn có thể hỏi AI Coach bất cứ lúc nào nếu cần trợ giúp thêm.',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const MAX_TOOLTIP_WIDTH = 340;
const TOOLTIP_GAP = 14;
const VIEWPORT_MARGIN = 8;
// Guess used before the tooltip has been measured for the first time —
// close enough to typical content height to avoid a visible jump.
const ESTIMATED_TOOLTIP_HEIGHT = 220;

function measure(target: string | undefined): Rect | null {
  if (!target) return null;
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

interface OnboardingTourProps<Tab extends string = OnboardingTab> {
  onTabChange: (tab: Tab) => void;
  onFinish: () => void;
  /** Custom step sequence (e.g. mobile anchors); defaults to the desktop tour. */
  steps?: OnboardingStep<Tab>[];
}

export function OnboardingTour<Tab extends string = OnboardingTab>({
  onTabChange,
  onFinish,
  steps,
}: OnboardingTourProps<Tab>) {
  const STEPS = (steps ?? DESKTOP_STEPS) as OnboardingStep<Tab>[];
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  // Measure the tooltip's real height after each render so positioning can
  // account for its actual size instead of a guess (fixes the tooltip being
  // pushed off the top of the screen when a target sits close to the top).
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.getBoundingClientRect().height);
    }
  });

  const remeasure = useCallback(() => {
    setRect(measure(step.target));
  }, [step.target]);

  // Switch tab (if this step needs it), wait for the display:block/none flip
  // to settle, then scroll the target into view and measure it — in that
  // order, and with instant (not smooth) scrolling. Measuring before an
  // animated scroll finishes captures a stale position: the spotlight box
  // (fixed-position, based on that stale rect) then stays put while the
  // element keeps sliding underneath it during the animation, so the
  // highlight ends up not lining up with anything once the scroll settles.
  useEffect(() => {
    if (step.tab) onTabChange(step.tab);
    setRect(null);
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (step.target) {
          // 'auto' is the CSSOM spec's instant jump (not smooth-scrolling),
          // so the element is already in its final position by the time we
          // measure it right after.
          document
            .querySelector(`[data-tour="${step.target}"]`)
            ?.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
        remeasure();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  // Keep the spotlight glued to the target if anything scrolls or resizes
  // after the initial placement (e.g. a nested scroll container settling,
  // or the user scrolling manually while the tour is open). `capture: true`
  // is required for scroll — it doesn't bubble, but ancestors still see it
  // during the capture phase, so a single window listener covers any
  // scrollable container on the page.
  useEffect(() => {
    if (!step.target) return;
    window.addEventListener('resize', remeasure);
    window.addEventListener('scroll', remeasure, { capture: true });
    return () => {
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('scroll', remeasure, { capture: true });
    };
  }, [step.target, remeasure]);

  const handleNext = () => {
    if (isLast) {
      onFinish();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFinish();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stepIndex],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Centered card (no target — welcome / finish) ──────────────────────
  if (!step.target || !rect) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-4">
        <div className="bg-overlay border border-line rounded-panel w-full max-w-md shadow-[0_16px_48px_rgba(0,0,0,0.5)] p-6 sm:p-8">
          <img src={logoImage} alt="" aria-hidden="true" className="h-10 w-auto mb-5" />
          <h2 className="text-white font-semibold text-xl mb-2">{step.title}</h2>
          <p className="text-white/64 text-sm leading-relaxed mb-6">{step.description}</p>
          <StepFooter
            stepIndex={stepIndex}
            total={STEPS.length}
            isFirst={isFirst}
            isLast={isLast}
            onBack={handleBack}
            onNext={handleNext}
            onSkip={onFinish}
            centered
          />
        </div>
      </div>
    );
  }

  // ── Spotlight around a real element ────────────────────────────────────
  const box = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  const tipHeight = tooltipHeight ?? ESTIMATED_TOOLTIP_HEIGHT;
  const spaceBelow = window.innerHeight - (box.top + box.height) - TOOLTIP_GAP - VIEWPORT_MARGIN;
  const spaceAbove = box.top - TOOLTIP_GAP - VIEWPORT_MARGIN;

  // Prefer the requested placement, but fall back to whichever side actually
  // has room for the tooltip's real height — never trust a fixed threshold.
  const placement = step.placement ?? 'bottom';
  const fitsBelow = spaceBelow >= tipHeight;
  const fitsAbove = spaceAbove >= tipHeight;
  let showBelow: boolean;
  if (placement === 'bottom') {
    showBelow = fitsBelow || !fitsAbove;
  } else {
    showBelow = !fitsAbove && fitsBelow;
  }

  // Clamp the final top position so the tooltip always stays fully on
  // screen, even if neither side has the "ideal" amount of space.
  const idealTop = showBelow ? box.top + box.height + TOOLTIP_GAP : box.top - TOOLTIP_GAP - tipHeight;
  const tooltipTop = Math.min(
    Math.max(VIEWPORT_MARGIN, idealTop),
    window.innerHeight - tipHeight - VIEWPORT_MARGIN,
  );
  // Shrink the tooltip to fit narrow viewports (phones) instead of only
  // clamping its position — a fixed 340px width alone can exceed a
  // 320-360px-wide screen no matter how `left` is clamped.
  const tooltipWidth = Math.min(MAX_TOOLTIP_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
  const tooltipLeft = Math.min(
    Math.max(VIEWPORT_MARGIN, box.left + box.width / 2 - tooltipWidth / 2),
    window.innerWidth - tooltipWidth - VIEWPORT_MARGIN,
  );

  return (
    <div className="fixed inset-0 z-[200]" aria-live="polite">
      {/* Spotlight box — box-shadow spread dims everything outside it */}
      <div
        className="fixed rounded-panel border-2 border-[#0F6B3E] transition-all duration-300 pointer-events-none"
        style={{
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.75), 0 0 30px rgba(15,107,62,0.5)',
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed bg-[#141414] border border-line rounded-panel shadow-2xl p-5 transition-all duration-300 max-h-[calc(100vh-16px)] overflow-y-auto"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-white font-bold text-base">{step.title}</h3>
          <button
            type="button"
            onClick={onFinish}
            className="text-white/64 hover:text-white transition-colors shrink-0"
            aria-label="Bỏ qua hướng dẫn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-white/64 text-sm leading-relaxed mb-4">{step.description}</p>
        <StepFooter
          stepIndex={stepIndex}
          total={STEPS.length}
          isFirst={isFirst}
          isLast={isLast}
          onBack={handleBack}
          onNext={handleNext}
          onSkip={onFinish}
        />
      </div>
    </div>
  );
}

function StepFooter({
  stepIndex,
  total,
  isFirst,
  isLast,
  onBack,
  onNext,
  onSkip,
  centered = false,
}: {
  stepIndex: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  centered?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 ${centered ? 'items-center' : ''}`}>
      {/* Step dots */}
      <div className="flex items-center gap-1.5" aria-label={`Bước ${stepIndex + 1} / ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/15'
            }`}
          />
        ))}
      </div>

      <div className={`flex items-center gap-2 ${centered ? 'justify-center w-full' : 'justify-between w-full'}`}>
        <button
          type="button"
          onClick={onSkip}
          className="text-white/40 hover:text-white text-sm transition-colors px-2 py-1.5"
        >
          Bỏ qua
        </button>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={onBack}
              className="text-white/64 hover:text-white text-sm px-3 py-1.5 rounded-control hover:bg-white/5 transition-all"
            >
              Quay lại
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            {isLast ? (
              <>
                Hoàn tất <Check className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Tiếp theo <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      <span className="text-white/40 text-xs">
        Bước {stepIndex + 1} / {total}
      </span>
    </div>
  );
}
