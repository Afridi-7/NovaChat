import { useState, useCallback, useEffect } from 'react';
import { Message, ChatSession, ChatConfig } from '../types/chat';
import { chatApi } from '../services/chatApi';
import { DEFAULT_CHAT_CONFIG } from '../config/chatConfig';

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [config, setConfig] = useState<ChatConfig>(DEFAULT_CHAT_CONFIG);

  // Load chat history on session change
  useEffect(() => {
    loadHistory();
  }, [sessionId]);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getHistory(sessionId);
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        setError(response.error || 'Failed to load chat history');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage(sessionId, content.trim());
      
      if (response.success && response.data) {
        // Remove user message and reload to get both messages from backend
        await loadHistory();
      } else {
        setError(response.error || 'Failed to send message');
        // Remove the user message on error
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      }
    } catch (err) {
      setError('Network error occurred');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [sessionId, isLoading, loadHistory]);

  const resetChat = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.resetSession(sessionId);
      if (response.success) {
        setMessages([]);
      } else {
        setError(response.error || 'Failed to reset chat');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const updateMessageReaction = useCallback((messageId: string, reaction: 'like' | 'dislike' | null) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, reaction } : msg
    ));
  }, []);

  return {
    messages,
    isLoading,
    error,
    isTyping,
    config,
    sendMessage,
    resetChat,
    updateMessageReaction,
    setConfig,
    clearError: () => setError(null)
  };
}