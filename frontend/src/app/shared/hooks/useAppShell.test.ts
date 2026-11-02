import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAppShell } from './useAppShell';

describe('useAppShell', () => {
  it('enables shell mode with a viewport height while mounted and fully cleans up', () => {
    const root = document.documentElement;
    const { unmount } = renderHook(() => useAppShell());

    expect(root.classList.contains('app-shell')).toBe(true);
    expect(root.style.getPropertyValue('--app-height')).toMatch(/^\d+px$/);

    unmount();
    expect(root.classList.contains('app-shell')).toBe(false);
    expect(root.style.getPropertyValue('--app-height')).toBe('');
  });
});
