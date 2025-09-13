export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  reaction?: 'like' | 'dislike' | null;
  attachments?: Attachment[];
  metadata?: MessageMetadata;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  size: number;
  mimeType: string;
}

export interface MessageMetadata {
  tokens?: number;
  model?: string;
  temperature?: number;
  processingTime?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  isStarred?: boolean;
  isArchived?: boolean;
  tags?: string[];
}

export interface ChatConfig {
  personality: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  model: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  metadata?: MessageMetadata;
}

export interface VoiceRecording {
  isRecording: boolean;
  duration: number;
  audioBlob?: Blob;
}

export interface SearchResult {
  message: Message;
  sessionId: string;
  sessionTitle: string;
  relevanceScore: number;
}