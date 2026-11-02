import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { readParam, useInitialSearchParams, useSyncSearchParams } from './useDashboardUrlState';

type Tab = 'home' | 'bookings' | 'chat';
const TABS: readonly Tab[] = ['home', 'bookings', 'chat'];

function Harness() {
  const initial = useInitialSearchParams();
  const [tab, setTab] = useState<Tab>(() => readParam(initial, 'tab', TABS, 'home', { booking: 'bookings' }));
  useSyncSearchParams({ tab: tab === 'home' ? null : tab });
  const location = useLocation();
  return (
    <>
      <p data-testid="tab">{tab}</p>
      <p data-testid="search">{location.search}</p>
      <button onClick={() => setTab('chat')}>chat</button>
      <button onClick={() => setTab('home')}>home</button>
    </>
  );
}

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Harness />
    </MemoryRouter>,
  );

describe('useDashboardUrlState', () => {
  it('restores a valid tab from the URL', () => {
    renderAt('/dashboard?tab=bookings');
    expect(screen.getByTestId('tab')).toHaveTextContent('bookings');
  });

  it('maps aliases and rejects unknown values', () => {
    renderAt('/dashboard?tab=booking');
    expect(screen.getByTestId('tab')).toHaveTextContent('bookings');
  });

  it('falls back to the default for an unknown tab and cleans the URL', () => {
    renderAt('/dashboard?tab=hacker');
    expect(screen.getByTestId('tab')).toHaveTextContent('home');
    expect(screen.getByTestId('search')).toHaveTextContent('');
  });

  it('writes the tab to the URL and drops it again for the default tab', () => {
    renderAt('/dashboard?keep=1');
    fireEvent.click(screen.getByText('chat'));
    expect(screen.getByTestId('search')).toHaveTextContent('?keep=1&tab=chat');
    fireEvent.click(screen.getByText('home'));
    expect(screen.getByTestId('search')).toHaveTextContent('?keep=1');
    expect(screen.getByTestId('search')).not.toHaveTextContent('tab=');
  });
});
