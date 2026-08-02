import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoachScreen } from './CoachScreen';

vi.mock('../../../lib/api/chat', () => ({
  sendChatMessage: vi.fn().mockResolvedValue({ conversation_id: 'c1', message: 'ok' }),
}));
vi.mock('../../../lib/auth', () => ({
  getAuthUser: () => ({ id: 'cust-1' }),
}));

describe('CoachScreen', () => {
  it('renders the header title and the chat panel welcome message', () => {
    render(<CoachScreen chatKey={0} onNewChat={vi.fn()} />);
    expect(screen.getByText('Renfit AI Coach')).toBeInTheDocument();
    expect(screen.getByText(/Xin chào! Tôi là Renfit AI Coach/)).toBeInTheDocument();
  });

  it('calls onNewChat when the header action is tapped', () => {
    const onNewChat = vi.fn();
    render(<CoachScreen chatKey={0} onNewChat={onNewChat} />);
    fireEvent.click(screen.getByTestId('coach-new-chat-button'));
    expect(onNewChat).toHaveBeenCalledOnce();
  });
});
