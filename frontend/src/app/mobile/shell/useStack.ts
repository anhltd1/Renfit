import { useCallback, useState } from 'react';

/**
 * In-memory push/pop/reset navigation stack (U4 Trainee Mobile, TS-1).
 *
 * Deliberately NOT wired to the browser back button or the URL (see
 * business-rules.md NAV-3) — routes stay the same for both devices per the
 * approved architecture; this only tracks which screen is "on top" within a
 * single mobile tab, mirroring the existing tab-switch state pattern.
 */
export interface StackState<T> {
  stack: T[];
  current: T;
  push(screen: T): void;
  pop(): void;
  reset(screen: T): void;
  /** True when there is a screen below the current one (i.e. pop() would do something). */
  canPop: boolean;
}

/**
 * @param initial root screen
 * @param restored optional screen to start on top of the root (e.g. restored
 *   from the URL after a refresh); ignored when it equals the root.
 */
export function useStack<T>(initial: T, restored?: T): StackState<T> {
  const [stack, setStack] = useState<T[]>(() =>
    restored !== undefined && restored !== initial ? [initial, restored] : [initial],
  );

  const push = useCallback((screen: T) => {
    setStack((prev) => [...prev, screen]);
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const reset = useCallback((screen: T) => {
    setStack([screen]);
  }, []);

  return {
    stack,
    current: stack[stack.length - 1],
    push,
    pop,
    reset,
    canPop: stack.length > 1,
  };
}
