// ============================================================
// Groq API Client — Streams responses via SSE proxy
// ============================================================

import type { ChatCompletionRequest } from './types';

const PROXY_URL = import.meta.env.VITE_API_URL || '/api/chat';

/**
 * Stream chat completions from the Groq proxy server.
 * Uses Server-Sent Events (SSE) for token-by-token streaming.
 */
export async function streamChatFromProxy(
  messages: ChatCompletionRequest['messages'],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Proxy error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'data: [DONE]') {
          onDone();
          return;
        }
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const text = data.choices?.[0]?.delta?.content || '';
            if (text) onChunk(text);
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}

/**
 * Send a non-streaming chat request for insight generation.
 */
export async function generateInsights(
  messages: ChatCompletionRequest['messages']
): Promise<string> {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status}`);
  }

  // Try to read as JSON first, fall back to streaming
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Read SSE stream and collect full response
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is not readable');

  const decoder = new TextDecoder();
  let result = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === 'data: [DONE]') return result;
      if (trimmed.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          result += data.choices?.[0]?.delta?.content || '';
        } catch {
          // Skip malformed chunks
        }
      }
    }
  }

  return result;
}
