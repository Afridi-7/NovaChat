import { Message, ChatSession, ApiResponse, ChatResponse } from '../types/chat';

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

  async sendMessage(sessionId: string, message: string): Promise<ApiResponse<ChatResponse>> {
    return this.makeRequest<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        message: message
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
}

export const chatApi = new ChatApiService();