import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from '../src/components/chat/ChatWindow';
import { useChatStore } from '../src/store/chatStore';

// Mock scroll utilities that are not supported in jsdom env
window.HTMLElement.prototype.scrollTo = vi.fn();

const mockSendMessage = vi.fn();
const mockSaveAndClearSession = vi.fn();
const mockExitSessionView = vi.fn();

let mockChatState = {
  messages: [] as any[],
  isStreaming: false,
  error: null as string | null,
  viewingSessionId: null as string | null,
  sendMessage: mockSendMessage,
  saveAndClearSession: mockSaveAndClearSession,
  exitSessionView: mockExitSessionView,
};

vi.mock('../src/hooks/useChat', () => ({
  useChat: () => mockChatState,
}));

describe('ChatWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatState = {
      messages: [],
      isStreaming: false,
      error: null,
      viewingSessionId: null,
      sendMessage: mockSendMessage,
      saveAndClearSession: mockSaveAndClearSession,
      exitSessionView: mockExitSessionView,
    };
  });

  it('renders input field and send button', () => {
    render(<ChatWindow />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<ChatWindow />);
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('sanitizes user input before sending', async () => {
    const mockSend = vi.fn();
    render(<ChatWindow onSend={mockSend} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '<script>alert("xss")</script>' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(mockSend).toHaveBeenCalledWith('alert("xss")');
  });

  it('handles API timeout by showing error and re-enabling input', async () => {
    mockChatState = {
      messages: [],
      isStreaming: true,
      error: null,
      viewingSessionId: null,
      sendMessage: mockSendMessage,
      saveAndClearSession: mockSaveAndClearSession,
      exitSessionView: mockExitSessionView,
    };
    const { rerender } = render(<ChatWindow />);
    expect(screen.getByRole('textbox')).toBeDisabled();

    // Simulate timeout error state
    mockChatState = {
      messages: [],
      isStreaming: false,
      error: 'Request timed out after 5000ms',
      viewingSessionId: null,
      sendMessage: mockSendMessage,
      saveAndClearSession: mockSaveAndClearSession,
      exitSessionView: mockExitSessionView,
    };
    rerender(<ChatWindow />);

    expect(screen.getByRole('textbox')).toBeEnabled();
    expect(screen.getByText('Request timed out after 5000ms')).toBeInTheDocument();
  });

  it('shows offline banner when navigator.onLine is false', () => {
    const onlineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<ChatWindow />);
    
    // Trigger offline event
    fireEvent(window, new Event('offline'));
    
    expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
    onlineSpy.mockRestore();
  });

  it('removes the oldest message from state after 11 messages', () => {
    useChatStore.setState({ messages: [] });
    
    // Add 11 messages
    for (let i = 1; i <= 11; i++) {
      useChatStore.getState().addMessage({
        id: `msg-${i}`,
        role: 'user',
        content: `Message ${i}`,
        timestamp: Date.now(),
      });
    }
    
    expect(useChatStore.getState().messages.length).toBe(11);
    expect(useChatStore.getState().messages[0]?.content).toBe('Message 1');
    
    // Add 12th message
    useChatStore.getState().addMessage({
      id: 'msg-12',
      role: 'user',
      content: 'Message 12',
      timestamp: Date.now(),
    });
    
    expect(useChatStore.getState().messages.length).toBe(11);
    expect(useChatStore.getState().messages[0]?.content).toBe('Message 2'); // oldest was removed!
  });
});
