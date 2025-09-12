import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square, 
  Image, 
  FileText, 
  Smile,
  Zap,
  Camera
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isVoiceMode?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  isVoiceMode = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording functionality would be implemented here
  };

  const attachmentOptions = [
    { icon: Image, label: 'Image', color: 'from-pink-400 to-purple-500' },
    { icon: FileText, label: 'Document', color: 'from-blue-400 to-indigo-500' },
    { icon: Camera, label: 'Camera', color: 'from-green-400 to-blue-500' }
  ];

  const quickEmojis = ['😊', '👍', '❤️', '😂', '🤔', '👏', '🔥', '✨'];

  return (
    <div className="glass-strong border-t border-white/10 p-4">
      {/* Attachment Options */}
      {showAttachments && (
        <div className="mb-4 flex space-x-3 animate-slide-in-up">
          {attachmentOptions.map((option, index) => (
            <button
              key={option.label}
              className="flex flex-col items-center p-3 glass rounded-xl hover:bg-white/10 transition-all duration-300 hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300`}>
                <option.icon size={20} className="text-white" />
              </div>
              <span className="text-xs text-white/80">{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojis && (
        <div className="mb-4 flex flex-wrap gap-2 animate-slide-in-up">
          {quickEmojis.map((emoji, index) => (
            <button
              key={emoji}
              onClick={() => setMessage(prev => prev + emoji)}
              className="w-10 h-10 glass rounded-lg hover:bg-white/10 transition-all duration-300 hover-scale text-lg"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => setShowAttachments(!showAttachments)}
          className={`btn-floating w-12 h-12 hover-scale ${showAttachments ? 'bg-white/20' : ''}`}
          title="Attachments"
        >
          <Paperclip size={20} />
        </button>

        {/* Message Input Container */}
        <div className="flex-1 relative">
          <div className="glass rounded-2xl p-1">
            <div className="flex items-end space-x-2 p-2">
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover-scale"
                title="Emojis"
              >
                <Smile size={18} />
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-transparent border-none resize-none focus:outline-none text-white placeholder-white/60 min-h-[40px] max-h-[120px] py-2"
                rows={1}
              />

              {/* Character Counter */}
              {message.length > 0 && (
                <div className="text-xs text-white/40 px-2">
                  {message.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voice Recording Button */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`btn-floating w-12 h-12 hover-scale ${
            isRecording
              ? 'bg-gradient-to-r from-red-400 to-red-600'
              : isVoiceMode 
                ? 'bg-gradient-to-r from-purple-400 to-pink-500'
                : ''
          }`}
          title={isRecording ? 'Stop recording' : 'Voice recording'}
        >
          {isRecording ? <Square size={20} /> : <Mic size={20} />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="btn-floating w-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed hover-scale"
          title="Send message"
        >
          <Send size={20} />
        </button>
      </form>

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="mt-3 flex items-center justify-center animate-slide-in-up">
          <div className="flex items-center space-x-3 glass px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-soft"></div>
            <span className="text-sm text-white/90">Recording...</span>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-4 bg-red-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-3 flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center space-x-4">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap size={12} />
          <span>AI-powered</span>
        </div>
      </div>
    </div>
  );
}