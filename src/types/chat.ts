export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  reaction?: 'like' | 'dislike' | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatConfig {
  personality: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  model: string;
}

export interface ApiResponse<T> {
  success: bool  ean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatResponse {
  message: string;
  session_id: string;
}