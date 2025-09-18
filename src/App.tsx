import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { FloatingElements } from './components/FloatingElements';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { NotificationCenter } from './components/NotificationCenter';
import { QuickActions } from './components/QuickActions';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';
import { Attachment } from './types/chat';
import { Menu, X, Bot, AlertCircle, Sparkles, Zap, Settings, Search, Wifi, WifiOff } from 'lucide-react';
import { chatApi } from './services/chatApi';

function App() {
  const [currentSessionId, setCurrentSessionId] = useState(() => 
    localStorage.getItem('currentSessionId') || Date.now().toString()
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { resolvedTheme } = useTheme();
  const { addNotification } = useNotifications();
  const {
    messages,
    isLoading,
    error,
    isTyping,
    sendMessage,
    resetChat,
    updateMessageReaction,
    regenerateResponse,
    clearError
  } = useChat(currentSessionId);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial sidebar state based on screen size
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check backend status
  useEffect(() => {
    const checkBackendStatus = async () => {
      setBackendStatus('checking');
      const response = await chatApi.healthCheck();
      setBackendStatus(response.success ? 'online' : 'offline');
    };

    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification('Connection restored! 🌐', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      addNotification('Connection lost. Some features may be unavailable.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Save current session to localStorage
  useEffect(() => {
    localStorage.setItem('currentSessionId', currentSessionId);
  }, [currentSessionId]);

  const handleNewChat = () => {
    const newSessionId = Date.now().toString();
    setCurrentSessionId(newSessionId);
    setSidebarOpen(false);
    addNotification('New chat started! 🚀', 'success');
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessionId === currentSessionId) {
      handleNewChat();
    }
    addNotification('Chat deleted', 'info');
  };

  const handleSendMessage = async (message: string, attachments?: Attachment[]) => {
    if (!isOnline || backendStatus === 'offline') {
      addNotification('Cannot send message while offline', 'error');
      return;
    }

    await sendMessage(message);
    clearError();
  };

  const handleQuickAction = (action: string) => {
    const quickPrompts = {
      explain: "Can you explain this concept in simple terms?",
      creative: "Help me brainstorm creative ideas for...",
      code: "Can you help me write code for...",
      analyze: "Please analyze this and provide insights:",
      translate: "Can you translate this text?",
      summarize: "Please summarize this content:"
    };
    
    const prompt = quickPrompts[action as keyof typeof quickPrompts];
    if (prompt) {
      handleSendMessage(prompt);
      setShowQuickActions(false);
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-400';
    if (backendStatus === 'offline') return 'text-red-400';
    if (backendStatus === 'checking') return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (backendStatus === 'offline') return 'Server offline';
    if (backendStatus === 'checking') return 'Connecting...';
    if (isTyping) return 'Thinking...';
    return 'Ready to assist';
  };

  return (
    <ErrorBoundary>
      <div className={`flex h-screen relative overflow-hidden ${resolvedTheme} bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900`}>
        {/* Floating Background Elements */}
        <FloatingElements />
        
        {/* Notification Center */}
        <NotificationCenter />

        {/* Sidebar */}
        <Sidebar
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Header */}
          <header className="glass-strong border-b border-white/10 p-3 sm:p-4 animate-slide-in-up">
            <div className="flex items-center justify-between max-w-full">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 text-white hover:text-white flex-shrink-0"
                >
                  {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
                
                <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                  <div className="relative">
                    <div className="avatar-assistant animate-float w-8 h-8 sm:w-10 sm:h-10">
                      <Bot size={16} className="sm:hidden" />
                      <Bot size={20} className="hidden sm:block" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-white text-glow truncate">
                      NovaChat
                    </h1>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isOnline && backendStatus === 'online' ? 'bg-green-400' : 'bg-red-400'
                      } animate-pulse-soft`}></div>
                      <p className={`text-xs sm:text-sm ${getStatusColor()} truncate`}>
                        {getStatusText()}
                      </p>
                      {!isOnline ? (
                        <WifiOff size={12} className="text-red-400 flex-shrink-0" />
                      ) : (
                        <Wifi size={12} className={`${getStatusColor()} flex-shrink-0`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="btn-secondary p-2 hover-scale hidden sm:flex"
                  title="Quick Actions"
                >
                  <Zap size={16} />
                </button>
                
                <button
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`btn-secondary p-2 hover-scale hidden sm:flex ${isVoiceMode ? 'bg-white/20' : ''}`}
                  title="Voice Mode"
                >
                  <Sparkles size={16} />
                </button>

                {messages.length > 0 && (
                  <button
                    onClick={resetChat}
                    className="btn-secondary px-2 sm:px-4 py-2 text-xs sm:text-sm hover-lift"
                  >
                    <span className="hidden sm:inline">Clear Chat</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Quick Actions Panel */}
          {showQuickActions && (
            <QuickActions
              onAction={handleQuickAction}
              onClose={() => setShowQuickActions(false)}
            />
          )}

          {/* Voice Visualizer */}
          {isVoiceMode && <VoiceVisualizer isActive={isTyping} />}

          {/* Error Display */}
          {error && (
            <div className="mx-3 sm:mx-4 mt-4 notification animate-slide-in-up">
              <div className="flex items-center space-x-2">
                <AlertCircle size={18} className="text-red-500" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-500 hover:text-red-700 hover-scale"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-2xl animate-scale-in px-4">
                  <div className="relative mb-8">
                    <div className="avatar-assistant w-16 h-16 sm:w-24 sm:h-24 mx-auto animate-float">
                      <Bot size={32} className="sm:hidden" />
                      <Bot size={48} className="hidden sm:block" />
                    </div>
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse-soft">
                      <Sparkles size={12} className="text-white sm:hidden" />
                      <Sparkles size={16} className="text-white hidden sm:block" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 text-glow">
                    Welcome to NovaChat
                  </h2>
                  <p className="text-white/80 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                    Your advanced AI companion is ready to assist! Experience intelligent, 
                    contextual conversations powered by cutting-edge AI technology.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="card-modern hover-lift animate-slide-in-left" style={{animationDelay: '0.1s'}}>
                      <div className="text-2xl mb-3">💡</div>
                      <h3 className="font-semibold text-white mb-2">Ask Anything</h3>
                      <p className="text-white/70 text-xs sm:text-sm">General questions, explanations, advice</p>
                    </div>
                    
                    <div className="card-modern hover-lift animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                      <div className="text-2xl mb-3">✨</div>
                      <h3 className="font-semibold text-white mb-2">Creative Help</h3>
                      <p className="text-white/70 text-xs sm:text-sm">Writing, brainstorming, content creation</p>
                    </div>
                    
                    <div className="card-modern hover-lift animate-slide-in-right sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.3s'}}>
                      <div className="text-2xl mb-3">🔧</div>
                      <h3 className="font-semibold text-white mb-2">Problem Solving</h3>
                      <p className="text-white/70 text-xs sm:text-sm">Code help, debugging, technical issues</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {[
                      "Explain quantum computing",
                      "Write a creative story",
                      "Help with Python code",
                      "Plan a vacation",
                      "Analyze data trends"
                    ].map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(prompt)}
                        className="btn-secondary text-xs sm:text-sm hover-lift px-3 py-2"
                        style={{animationDelay: `${0.4 + index * 0.1}s`}}
                        disabled={!isOnline || backendStatus === 'offline'}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className="animate-slide-in-up message-container"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <ChatMessage
                      message={message}
                      onReaction={updateMessageReaction}
                      onRegenerate={regenerateResponse}
                    />
                  </div>
                ))}
                
                {isTyping && (
                  <div className="animate-slide-in-up message-container">
                    <ChatMessage
                      message={{
                        id: 'typing',
                        content: '',
                        sender: 'assistant',
                        timestamp: new Date(),
                        isTyping: true
                      }}
                      onReaction={() => {}}
                    />
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="animate-slide-in-up">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || !isOnline || backendStatus === 'offline'}
              placeholder={
                !isOnline ? "You're offline..." :
                backendStatus === 'offline' ? "Server offline..." :
                isLoading ? "AI is thinking..." : 
                "Type your message..."
              }
              isVoiceMode={isVoiceMode}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;