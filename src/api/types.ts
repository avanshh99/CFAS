// ============================================================
// API Types — Request / Response interfaces
// ============================================================

export interface ChatCompletionRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface InsightGenerationRequest {
  weeklyTotal: number;
  topCategory: string;
  categoryBreakdown: Array<{ category: string; total: number; percent: number }>;
  recentActivities: Array<{ type: string; co2e: number; date: string }>;
}

export interface ProxyErrorResponse {
  error: string;
  code: string;
}
