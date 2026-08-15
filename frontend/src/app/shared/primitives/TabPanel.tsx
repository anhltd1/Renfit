import { useEffect, useState } from 'react';
import { cn } from './cn';

/**
 * TabPanel — a tab/view panel that stays mounted when inactive but fades in
 * when it becomes active.
 *
 * The dashboards deliberately keep every tab mounted (chat history and scroll
 * position must survive tab switches), which means the panels were toggled
 * with `display: none` and therefore hard-cut with no motion at all.
 *
 * This uses a fade-through: the outgoing panel is hidden immediately and only
 * the incoming one animates. Two visible sibling panels would briefly fight
 * for space in the flex column, and an instant exit is also what feels
 * responsive — the user asked for the new content, not for the old one to
 * linger.
 *
 * Implemented with a transition (not a keyframe animation) because
 * `animation-fill-mode: both` would pin opacity/transform after the first run
 * and every later activation would be silent.
 */
export interface TabPanelProps {
  active: boolean;
  /** `display` value applied when active — panels differ (block vs flex). */
  display?: 'block' | 'flex';
  className?: string;
  children: React.ReactNode;
}

export function TabPanel({ active, display = 'block', className, children }: TabPanelProps) {
  // `false` until the browser has painted the panel in its from-state, so the
  // transition has something to animate away from.
  const [entered, setEntered] = useState(active);

  useEffect(() => {
    if (!active) {
      setEntered(false);
      return;
    }
    // Double rAF: the first frame commits `display`, the second flips the
    // transition target. A single frame can land in the same paint and skip
    // the animation entirely.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [active]);

  return (
    <div
      className={cn('tab-panel', active && !entered && 'tab-panel-enter', className)}
      style={{ display: active ? display : 'none' }}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}
