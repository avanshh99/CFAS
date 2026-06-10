import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import ChatWindow from '../src/components/chat/ChatWindow';

// Mock scroll utilities that are not supported in jsdom env
window.HTMLElement.prototype.scrollTo = vi.fn();

describe('ChatWindow', () => {
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
});
