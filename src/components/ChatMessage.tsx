import React, { useState, useEffect } from 'react';
import { Message, Attachment } from '../types/chat';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Clock, 
  Bot, 
  User,
  MoreHorizontal,
  Share,
  Bookmark,
  RefreshCw,
  Download,
  Eye,
  Play,
  Pause,
  Volume2
} from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onReaction: (messageId: string, reaction: 'like' | 'dislike' | null) => void;
  onRegenerate?: (messageId: string) => void;
}

export function ChatMessage({ message, onReaction, onRegenerate }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedAttachment, setExpandedAttachment] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Typewriter effect for AI responses
  useEffect(() => {
    if (message.sender === 'assistant' && !message.isTyping && message.content) {
      setDisplayedContent('');
      setIsTypingComplete(false);
      setCurrentIndex(0);

      const content = message.content;
      const typingSpeed = 30; // milliseconds per character
      
      const typeWriter = () => {
        let index = 0;
        const timer = setInterval(() => {
          if (index < content.length) {
            setDisplayedContent(content.slice(0, index + 1));
            setCurrentIndex(index + 1);
            index++;
          } else {
            setIsTypingComplete(true);
            clearInterval(timer);
          }
        }, typingSpeed);

        return () => clearInterval(timer);
      };

      const cleanup = typeWriter();
      return cleanup;
    } else if (message.sender === 'user' || message.isTyping) {
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
    }
  }, [message.content, message.sender, message.isTyping]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (reaction: 'like' | 'dislike') => {
    const newReaction = message.reaction === reaction ? null : reaction;
    onReaction(message.id, newReaction);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NovaChat Message',
          text: message.content,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    const isExpanded = expandedAttachment === attachment.id;

    return (
      <div key={attachment.id} className="mt-3 glass rounded-xl p-4 max-w-sm hover-lift transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              {attachment.type === 'image' && <Eye size={18} className="text-white" />}
              {attachment.type === 'document' && <Download size={18} className="text-white" />}
              {attachment.type === 'audio' && <Volume2 size={18} className="text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white/95">{attachment.name}</p>
              <p className="text-xs text-white/70">{(attachment.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedAttachment(isExpanded ? null : attachment.id)}
            className="text-white/70 hover:text-white hover-scale transition-all duration-300 p-2 hover:bg-white/10 rounded-lg"
          >
            <Eye size={16} />
          </button>
        </div>

        {isExpanded && (
          <div className="animate-scale-in">
            {attachment.type === 'image' && (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full rounded-xl max-h-64 object-cover shadow-lg"
              />
            )}
            {attachment.type === 'audio' && (
              <audio controls className="w-full rounded-lg">
                <source src={attachment.url} type={attachment.mimeType} />
              </audio>
            )}
            {attachment.type === 'document' && (
              <div className="text-center py-6">
                <p className="text-white/90 mb-3">Document preview not available</p>
                <a
                  href={attachment.url}
                  download={attachment.name}
                  className="btn-secondary text-sm hover-lift"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-8 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] group relative ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
        
        {/* Avatar */}
        <div className={`flex items-center mb-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`${message.sender === 'user' ? 'avatar-user' : 'avatar-assistant'} hover-scale transition-all duration-300 shadow-lg`}>
            {message.sender === 'user' ? <User size={22} /> : <Bot size={22} />}
          </div>
          <div className={`ml-4 ${message.sender === 'user' ? 'order-first mr-4 ml-0' : ''}`}>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-white/95">
                {message.sender === 'user' ? 'You' : 'NovaChat'}
              </span>
              <div className="flex items-center text-xs text-white/70">
                <Clock size={12} className="mr-1" />
                {formatTime(message.timestamp)}
              </div>
              {message.metadata?.model && (
                <span className="text-xs text-white/50 px-2 py-1 bg-white/10 rounded-full border border-white/20">
                  {message.metadata.model}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message Bubble */}
        <div 
          className={`relative ${
            message.sender === 'user' ? 'message-user' : 'message-assistant'
          } hover-lift transition-all duration-300 shadow-lg`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {message.isTyping ? (
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="typing-dot w-2.5 h-2.5 bg-purple-400 rounded-full"></div>
                <div className="typing-dot w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                <div className="typing-dot w-2.5 h-2.5 bg-indigo-400 rounded-full"></div>
              </div>
              <span className="text-sm text-white/80 ml-3">Thinking...</span>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                {message.sender === 'assistant' ? (
                  <span className="relative">
                    {displayedContent}
                    {!isTypingComplete && (
                      <span className="inline-block w-0.5 h-5 bg-purple-400 ml-0.5 animate-pulse"></span>
                    )}
                  </span>
                ) : (
                  message.content
                )}
              </div>
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-4">
                  {message.attachments.map(renderAttachment)}
                </div>
              )}

              {/* Metadata */}
              {message.metadata && isTypingComplete && (
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60 animate-slide-in-up">
                  <div className="flex items-center space-x-4">
                    {message.metadata.tokens && (
                      <span className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span>{message.metadata.tokens} tokens</span>
                      </span>
                    )}
                    {message.metadata.processingTime && (
                      <span className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>{message.metadata.processingTime}ms</span>
                      </span>
                    )}
                    {message.metadata.temperature && (
                      <span className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                        <span>temp: {message.metadata.temperature}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Message Actions */}
          {!message.isTyping && showActions && isTypingComplete && (
            <div className={`absolute top-3 ${
              message.sender === 'user' ? '-left-20' : '-right-20'
            } opacity-0 group-hover:opacity-100 transition-all duration-300 animate-scale-in z-10`}>
              <div className="flex flex-col space-y-1 p-2 glass-strong rounded-xl shadow-xl border border-white/20">
                <button
                  onClick={copyToClipboard}
                  className="p-2.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover-scale group/btn"
                  title={copied ? "Copied!" : "Copy message"}
                >
                  <Copy size={14} className={copied ? "text-green-400" : ""} />
                </button>
                
                {message.sender === 'assistant' && (
                  <>
                    <button
                      onClick={() => handleReaction('like')}
                      className={`p-2.5 hover:bg-white/15 rounded-lg transition-all duration-300 hover-scale ${
                        message.reaction === 'like' ? 'text-green-400 bg-green-400/20' : 'text-white/80 hover:text-white'
                      }`}
                      title="Like"
                    >
                      <ThumbsUp size={14} />
                    </button>
                    
                    <button
                      onClick={() => handleReaction('dislike')}
                      className={`p-2.5 hover:bg-white/15 rounded-lg transition-all duration-300 hover-scale ${
                        message.reaction === 'dislike' ? 'text-red-400 bg-red-400/20' : 'text-white/80 hover:text-white'
                      }`}
                      title="Dislike"
                    >
                      <ThumbsDown size={14} />
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-2.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover-scale"
                      title="Share"
                    >
                      <Share size={14} />
                    </button>

                    <button
                      className="p-2.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover-scale"
                      title="Bookmark"
                    >
                      <Bookmark size={14} />
                    </button>

                    {onRegenerate && (
                      <button
                        onClick={() => onRegenerate(message.id)}
                        className="p-2.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover-scale"
                        title="Regenerate"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reaction Display */}
        {message.reaction && !message.isTyping && (
          <div className={`flex mt-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center space-x-2 px-3 py-1.5 glass rounded-full text-xs animate-scale-in shadow-lg">
              {message.reaction === 'like' ? (
                <ThumbsUp size={12} className="text-green-400" />
              ) : (
                <ThumbsDown size={12} className="text-red-400" />
              )}
              <span className="text-white/90 font-medium">
                {message.reaction === 'like' ? 'Liked' : 'Disliked'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}