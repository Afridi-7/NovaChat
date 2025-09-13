import React, { useState, useEffect } from 'react';
import { ChatSession } from '../types/chat';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  Settings, 
  Moon, 
  Sun, 
  Monitor,
  Star,
  Archive,
  Filter,
  Sparkles,
  Bot,
  Edit3,
  Download,
  Upload
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { chatApi } from '../services/chatApi';

interface SidebarProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ 
  currentSessionId, 
  onSessionSelect, 
  onNewChat, 
  onDeleteSession,
  isOpen,
  onClose 
}: SidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'starred' | 'archived'>('all');
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { theme, changeTheme } = useTheme();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const response = await chatApi.getAllSessions();
    if (response.success && response.data) {
      const formattedSessions = response.data.map(session => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }));
      setSessions(formattedSessions);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'starred' && session.isStarred) ||
                         (filter === 'archived' && session.isArchived);
    return matchesSearch && matchesFilter;
  });

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const handleStarSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, isStarred: !session.isStarred }
        : session
    ));
  };

  const handleEditTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSession(sessionId);
    setEditTitle(currentTitle);
  };

  const saveTitle = async (sessionId: string) => {
    if (editTitle.trim()) {
      const response = await chatApi.updateSessionTitle(sessionId, editTitle.trim());
      if (response.success) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, title: editTitle.trim() }
            : session
        ));
      }
    }
    setEditingSession(null);
    setEditTitle('');
  };

  const handleExportSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const response = await chatApi.exportSession(sessionId, 'json');
    if (response.success && response.data) {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${sessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Chats', count: sessions.length },
    { value: 'starred', label: 'Starred', count: sessions.filter(s => s.isStarred).length },
    { value: 'archived', label: 'Archived', count: sessions.filter(s => s.isArchived).length }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 sidebar-modern transform transition-all duration-500 ease-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="avatar-assistant w-10 h-10 animate-float">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">NovaChat</h2>
              <p className="text-xs text-white/60">AI Assistant</p>
            </div>
          </div>
          
          <button
            onClick={onNewChat}
            className="w-full btn-primary flex items-center justify-center space-x-2 hover-lift"
          >
            <Plus size={20} />
            <span>New Chat</span>
            <Sparkles size={16} className="ml-auto" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-white/10 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-10 text-sm"
            />
          </div>

          <div className="flex space-x-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all duration-300 ${
                  filter === option.value
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 animate-scale-in">
                <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                  <MessageSquare size={32} className="text-white/40" />
                </div>
                <p className="text-white/60 mb-2">No conversations yet</p>
                <p className="text-white/40 text-sm">Start chatting to see your history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session, index) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (editingSession !== session.id) {
                        onSessionSelect(session.id);
                        onClose();
                      }
                    }}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 hover-lift animate-slide-in-left ${
                      currentSessionId === session.id
                        ? 'bg-white/20 border border-white/30'
                        : 'hover:bg-white/10 border border-transparent'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        currentSessionId === session.id
                          ? 'bg-gradient-to-r from-purple-400 to-blue-400'
                          : 'bg-white/10'
                      }`}>
                        <MessageSquare size={16} className="text-white" />
                        {session.isStarred && (
                          <Star size={12} className="absolute -top-1 -right-1 text-yellow-400 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {editingSession === session.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => saveTitle(session.id)}
                            onKeyPress={(e) => e.key === 'Enter' && saveTitle(session.id)}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
                            autoFocus
                          />
                        ) : (
                          <h3 className={`font-medium truncate mb-1 ${
                            currentSessionId === session.id
                              ? 'text-white'
                              : 'text-white/90'
                          }`}>
                            {session.title}
                          </h3>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-white/60">
                            {session.messageCount || 0} messages
                          </p>
                          <p className="text-xs text-white/40">
                            {session.updatedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1">
                      <button
                        onClick={(e) => handleStarSession(session.id, e)}
                        className={`p-1 hover:bg-white/20 rounded transition-colors hover-scale ${
                          session.isStarred ? 'text-yellow-400' : 'text-white/60 hover:text-yellow-400'
                        }`}
                        title="Star conversation"
                      >
                        <Star size={14} />
                      </button>

                      <button
                        onClick={(e) => handleEditTitle(session.id, session.title, e)}
                        className="p-1 hover:bg-white/20 rounded text-white/60 hover:text-white transition-colors hover-scale"
                        title="Edit title"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={(e) => handleExportSession(session.id, e)}
                        className="p-1 hover:bg-white/20 rounded text-white/60 hover:text-blue-400 transition-colors hover-scale"
                        title="Export conversation"
                      >
                        <Download size={14} />
                      </button>
                      
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 hover:bg-white/20 rounded text-white/60 hover:text-red-400 transition-colors hover-scale"
                        title="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute bottom-20 left-4 right-4 card-modern animate-scale-in">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <Settings size={18} className="mr-2" />
              Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => changeTheme(option.value as any)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover-scale ${
                        theme === option.value
                          ? 'bg-white/20 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <option.icon size={18} className="mb-1" />
                      <span className="text-xs">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Data</label>
                <div className="space-y-2">
                  <button className="w-full btn-secondary text-sm flex items-center justify-center space-x-2">
                    <Upload size={16} />
                    <span>Import Chats</span>
                  </button>
                  <button className="w-full btn-secondary text-sm flex items-center justify-center space-x-2">
                    <Download size={16} />
                    <span>Export All</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center space-x-3 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover-lift"
          >
            <Settings size={18} />
            <span>Settings</span>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse-soft"></div>
          </button>
        </div>
      </div>
    </>
  );
}