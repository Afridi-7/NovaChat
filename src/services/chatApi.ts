import { Message, ChatSession, ApiResponse, ChatResponse, ChatConfig } from '../types/chat';

class ChatApiService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async sendMessage(sessionId: string, message: string, config?: ChatConfig): Promise<ApiResponse<ChatResponse>> {
    return this.makeRequest<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
        config: config ? {
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          model: config.model
        } : undefined
      })
    });
  }

  async getHistory(sessionId: string): Promise<ApiResponse<Message[]>> {
    return this.makeRequest<Message[]>(`/sessions/${sessionId}/history`);
  }

  async resetSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/sessions/${sessionId}/reset`, {
      method: 'POST'
    });
  }

  async getAllSessions(): Promise<ApiResponse<ChatSession[]>> {
    return this.makeRequest<ChatSession[]>('/sessions');
  }

  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }

  async updateSessionTitle(sessionId: string, title: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/sessions/${sessionId}/title`, {
      method: 'PUT',
      body: JSON.stringify({ title })
    });
  }

  async exportSession(sessionId: string, format: 'json' | 'txt' | 'md' = 'json'): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/sessions/${sessionId}/export?format=${format}`);
  }

  async searchMessages(query: string, sessionId?: string): Promise<ApiResponse<Message[]>> {
    const params = new URLSearchParams({ query });
    if (sessionId) params.append('session_id', sessionId);
    
    return this.makeRequest<Message[]>(`/search?${params.toString()}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('http://localhost:8000/');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: 'Backend server is not running'
      };
    }
  }

  // Voice recording endpoints
  async uploadAudio(sessionId: string, audioBlob: Blob): Promise<ApiResponse<ChatResponse>> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('session_id', sessionId);

    try {
      const response = await fetch(`${this.baseUrl}/voice`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Voice upload failed'
      };
    }
  }

  // File upload endpoints
  async uploadFile(sessionId: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed'
      };
    }
  }
}

export const chatApi = new ChatApiService();