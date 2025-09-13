import React, { useState } from 'react';
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
  Pause
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    const isExpanded = expandedAttachment === attachment.id;

    return (
      <div key={attachment.id} className="mt-2 glass rounded-lg p-3 max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              {attachment.type === 'image' && <Eye size={16} className="text-white" />}
              {attachment.type === 'document' && <Download size={16} className="text-white" />}
              {attachment.type === 'audio' && <Play size={16} className="text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">{attachment.name}</p>
              <p className="text-xs text-white/60">{(attachment.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedAttachment(isExpanded ? null : attachment.id)}
            className="text-white/60 hover:text-white hover-scale"
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
                className="w-full rounded-lg max-h-64 object-cover"
              />
            )}
            {attachment.type === 'audio' && (
              <audio controls className="w-full">
                <source src={attachment.url} type={attachment.mimeType} />
              </audio>
            )}
            {attachment.type === 'document' && (
              <div className="text-center py-4">
                <p className="text-white/80 mb-2">Document preview not available</p>
                <a
                  href={attachment.url}
                  download={attachment.name}
                  className="btn-secondary text-sm"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] group relative ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
        
        {/* Avatar */}
        <div className={`flex items-center mb-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`${message.sender === 'user' ? 'avatar-user' : 'avatar-assistant'} hover-scale`}>
            {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
          </div>
          <div className={`ml-3 ${message.sender === 'user' ? 'order-first mr-3 ml-0' : ''}`}>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white/90">
                {message.sender === 'user' ? 'You' : 'NovaChat'}
              </span>
              <div className="flex items-center text-xs text-white/60">
                <Clock size={12} className="mr-1" />
                {formatTime(message.timestamp)}
              </div>
              {message.metadata?.model && (
                <span className="text-xs text-white/40 px-2 py-1 bg-white/10 rounded-full">
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
          } hover-lift transition-all duration-300`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {message.isTyping ? (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-500 ml-2">Thinking...</span>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3">
                  {message.attachments.map(renderAttachment)}
                </div>
              )}

              {/* Metadata */}
              {message.metadata && (
                <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/60">
                  <div className="flex items-center space-x-4">
                    {message.metadata.tokens && (
                      <span>{message.metadata.tokens} tokens</span>
                    )}
                    {message.metadata.processingTime && (
                      <span>{message.metadata.processingTime}ms</span>
                    )}
                    {message.metadata.temperature && (
                      <span>temp: {message.metadata.temperature}</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Message Actions */}
          {!message.isTyping && showActions && (
            <div className={`absolute top-2 ${
              message.sender === 'user' ? '-left-16' : '-right-16'
            } opacity-0 group-hover:opacity-100 transition-all duration-300 animate-scale-in`}>
              <div className="flex flex-col space-y-1 p-2 glass rounded-xl shadow-lg">
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors hover-scale"
                  title={copied ? "Copied!" : "Copy message"}
                >
                  <Copy size={14} />
                </button>
                
                {message.sender === 'assistant' && (
                  <>
                    <button
                      onClick={() => handleReaction('like')}
                      className={`p-2 hover:bg-white/10 rounded-lg transition-colors hover-scale ${
                        message.reaction === 'like' ? 'text-green-400' : 'text-white/70 hover:text-white'
                      }`}
                      title="Like"
                    >
                      <ThumbsUp size={14} />
                    </button>
                    
                    <button
                      onClick={() => handleReaction('dislike')}
                      className={`p-2 hover:bg-white/10 rounded-lg transition-colors hover-scale ${
                        message.reaction === 'dislike' ? 'text-red-400' : 'text-white/70 hover:text-white'
                      }`}
                      title="Dislike"
                    >
                      <ThumbsDown size={14} />
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors hover-scale"
                      title="Share"
                    >
                      <Share size={14} />
                    </button>

                    <button
                      className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors hover-scale"
                      title="Bookmark"
                    >
                      <Bookmark size={14} />
                    </button>

                    {onRegenerate && (
                      <button
                        onClick={() => onRegenerate(message.id)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors hover-scale"
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
          <div className={`flex mt-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center space-x-1 px-2 py-1 glass rounded-full text-xs">
              {message.reaction === 'like' ? (
                <ThumbsUp size={12} className="text-green-400" />
              ) : (
                <ThumbsDown size={12} className="text-red-400" />
              )}
              <span className="text-white/80">
                {message.reaction === 'like' ? 'Liked' : 'Disliked'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}