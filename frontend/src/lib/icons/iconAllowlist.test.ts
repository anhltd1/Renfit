import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resolveIcon, ICON_ALLOWLIST, ICON_MAP } from './iconAllowlist';

describe('iconAllowlist (example-based)', () => {
  it('resolveIcon("Dumbbell") returns a non-null component', () => {
    const icon = resolveIcon('Dumbbell');
    expect(icon).not.toBeNull();
    expect(icon).toHaveProperty('render');
  });

  it('resolveIcon("Bot") returns a non-null component', () => {
    const icon = resolveIcon('Bot');
    expect(icon).not.toBeNull();
    expect(icon).toHaveProperty('render');
  });

  it('resolveIcon("") returns null', () => {
    expect(resolveIcon('')).toBeNull();
  });

  it('resolveIcon(null) returns null', () => {
    expect(resolveIcon(null)).toBeNull();
  });

  it('resolveIcon(undefined) returns null', () => {
    expect(resolveIcon(undefined)).toBeNull();
  });

  it('resolveIcon("NonExistentIcon") returns null', () => {
    expect(resolveIcon('NonExistentIcon')).toBeNull();
  });

  it('ICON_ALLOWLIST has exactly 24 entries', () => {
    expect(ICON_ALLOWLIST).toHaveLength(24);
  });

  it('ICON_MAP has exactly 24 keys', () => {
    expect(Object.keys(ICON_MAP)).toHaveLength(24);
  });
});

/**
 * **Validates: Requirements 9.3, 13.7**
 *
 * Property 7: Icon resolver correctness — allowlist names resolve to non-null
 * component, non-allowlist strings resolve to null.
 */
describe('iconAllowlist (property-based)', () => {
  const allowlistNames = ICON_ALLOWLIST.map((e) => e.name);
  const allowlistNameSet = new Set(allowlistNames);

  it('every allowlist name resolves to a non-null component', () => {
    fc.assert(
      fc.property(fc.constantFrom(...allowlistNames), (name) => {
        const icon = resolveIcon(name);
        return icon !== null && typeof icon === 'object' && 'render' in icon;
      }),
    );
  });

  it('arbitrary strings not in the allowlist resolve to null', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !allowlistNameSet.has(s)),
        (name) => {
          return resolveIcon(name) === null;
        },
      ),
    );
  });
});
