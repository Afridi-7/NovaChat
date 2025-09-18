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
  Camera,
  X,
  Play,
  Pause
} from 'lucide-react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useFileUpload } from '../hooks/useFileUpload';
import { Attachment } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { recording, startRecording, stopRecording, cancelRecording, clearRecording } = useVoiceRecording();
  const { uploadState, uploadFile, uploadMultipleFiles, clearError } = useFileUpload();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle voice recording completion
  useEffect(() => {
    if (recording.audioBlob && !recording.isRecording) {
      // In a real app, you would send the audio to the server for transcription
      // For now, we'll just show a placeholder message
      setMessage('🎤 Voice message recorded');
      clearRecording();
    }
  }, [recording.audioBlob, recording.isRecording, clearRecording]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments = await uploadMultipleFiles(files);
      setAttachments(prev => [...prev, ...newAttachments]);
      setShowAttachments(false);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const attachmentOptions = [
    { 
      icon: Image, 
      label: 'Image', 
      color: 'from-pink-400 to-purple-500',
      accept: 'image/*',
      onClick: () => fileInputRef.current?.click()
    },
    { 
      icon: FileText, 
      label: 'Document', 
      color: 'from-blue-400 to-indigo-500',
      accept: '.pdf,.doc,.docx,.txt,.md',
      onClick: () => fileInputRef.current?.click()
    },
    { 
      icon: Camera, 
      label: 'Camera', 
      color: 'from-green-400 to-blue-500',
      accept: 'image/*',
      onClick: () => {
        if (fileInputRef.current) {
          fileInputRef.current.accept = 'image/*';
          fileInputRef.current.setAttribute('capture', 'camera');
          fileInputRef.current.click();
        }
      }
    }
  ];

  const quickEmojis = ['😊', '👍', '❤️', '😂', '🤔', '👏', '🔥', '✨'];

  return (
    <div className="glass-strong border-t border-white/10 p-3 sm:p-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.md,audio/*"
      />

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <div className="mb-3 sm:mb-4 animate-slide-in-up">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">Uploading files...</span>
              <span className="text-sm text-white/70">{uploadState.progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadState.error && (
        <div className="mb-3 sm:mb-4 animate-slide-in-up">
          <div className="glass rounded-lg p-3 border border-red-400/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-300">{uploadState.error}</span>
              <button
                onClick={clearError}
                className="text-red-300 hover:text-red-100 hover-scale"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 sm:mb-4 animate-slide-in-up">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="glass rounded-lg p-2 flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                  {attachment.type === 'image' && <Image size={16} className="text-white" />}
                  {attachment.type === 'document' && <FileText size={16} className="text-white" />}
                  {attachment.type === 'audio' && <Mic size={16} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white/90 truncate">{attachment.name}</p>
                  <p className="text-xs text-white/60">{(attachment.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-white/60 hover:text-white hover-scale flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Options */}
      {showAttachments && (
        <div className="mb-3 sm:mb-4 flex space-x-2 sm:space-x-3 animate-slide-in-up overflow-x-auto">
          {attachmentOptions.map((option, index) => (
            <button
              key={option.label}
              onClick={option.onClick}
              className="flex flex-col items-center p-2 sm:p-3 glass rounded-xl hover:bg-white/10 transition-all duration-300 hover-lift group flex-shrink-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300`}>
                <option.icon size={16} className="text-white sm:hidden" />
                <option.icon size={20} className="text-white hidden sm:block" />
              </div>
              <span className="text-xs text-white/80">{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojis && (
        <div className="mb-3 sm:mb-4 flex flex-wrap gap-2 animate-slide-in-up">
          {quickEmojis.map((emoji, index) => (
            <button
              key={emoji}
              onClick={() => setMessage(prev => prev + emoji)}
              className="w-8 h-8 sm:w-10 sm:h-10 glass rounded-lg hover:bg-white/10 transition-all duration-300 hover-scale text-base sm:text-lg"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => setShowAttachments(!showAttachments)}
          className={`btn-floating w-10 h-10 sm:w-12 sm:h-12 hover-scale ${showAttachments ? 'bg-white/20' : ''}`}
          title="Attachments"
        >
          <Paperclip size={16} className="sm:hidden" />
          <Paperclip size={20} className="hidden sm:block" />
        </button>

        {/* Message Input Container */}
        <div className="flex-1 relative">
          <div className="glass rounded-2xl p-1">
            <div className="flex items-end space-x-1 sm:space-x-2 p-2">
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-1.5 sm:p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover-scale"
                title="Emojis"
              >
                <Smile size={16} className="sm:hidden" />
                <Smile size={18} className="hidden sm:block" />
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-transparent border-none resize-none focus:outline-none text-white placeholder-white/60 min-h-[36px] sm:min-h-[40px] max-h-[100px] sm:max-h-[120px] py-2 text-sm sm:text-base"
                rows={1}
              />

              {/* Character Counter */}
              {message.length > 0 && (
                <div className="text-xs text-white/40 px-1 sm:px-2 hidden sm:block">
                  {message.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voice Recording Button */}
        <button
          type="button"
          onClick={recording.isRecording ? stopRecording : startRecording}
          className={`btn-floating w-10 h-10 sm:w-12 sm:h-12 hover-scale ${
            recording.isRecording
              ? 'bg-gradient-to-r from-red-400 to-red-600'
              : isVoiceMode 
                ? 'bg-gradient-to-r from-purple-400 to-pink-500'
                : ''
          }`}
          title={recording.isRecording ? 'Stop recording' : 'Voice recording'}
        >
          {recording.isRecording ? (
            <>
              <Square size={16} className="sm:hidden" />
              <Square size={20} className="hidden sm:block" />
            </>
          ) : (
            <>
              <Mic size={16} className="sm:hidden" />
              <Mic size={20} className="hidden sm:block" />
            </>
          )}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="btn-floating w-10 h-10 sm:w-12 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed hover-scale"
          title="Send message"
        >
          <Send size={16} className="sm:hidden" />
          <Send size={20} className="hidden sm:block" />
        </button>
      </form>

      {/* Voice Recording Indicator */}
      {recording.isRecording && (
        <div className="mt-2 sm:mt-3 flex items-center justify-between animate-slide-in-up">
          <div className="flex items-center space-x-3 glass px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-soft"></div>
            <span className="text-sm text-white/90">Recording...</span>
            <span className="text-sm text-white/70">{formatDuration(recording.duration)}</span>
            <div className="flex space-x-1 hidden sm:flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-4 bg-red-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={cancelRecording}
            className="text-white/60 hover:text-white hover-scale ml-3"
            title="Cancel recording"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          <span className="sm:hidden">Enter to send</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap size={12} />
          <span>AI-powered</span>
        </div>
      </div>
    </div>
  );
}