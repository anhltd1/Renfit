import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as chatApi from '../../../lib/api/chat';
import { useChat } from './useChat';

afterEach(() => vi.restoreAllMocks());

describe('useChat', () => {
  it('send() delegates to sendChatMessage with the given payload', async () => {
    const response = { conversation_id: 'c1', message: 'Xin chào!' };
    const spy = vi.spyOn(chatApi, 'sendChatMessage').mockResolvedValue(response as any);
    const { result } = renderHook(() => useChat());

    let received: unknown;
    await act(async () => {
      received = await result.current.send({ message: 'Tôi muốn đặt lịch', customer_id: 'cust-1' });
    });

    expect(spy).toHaveBeenCalledWith({ message: 'Tôi muốn đặt lịch', customer_id: 'cust-1' });
    expect(received).toEqual(response);
  });
});
