import React from 'react';
import { 
  Lightbulb, 
  Palette, 
  Code, 
  BarChart3, 
  Languages, 
  FileText,
  X
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
  onClose: () => void;
}

export function QuickActions({ onAction, onClose }: QuickActionsProps) {
  const actions = [
    { id: 'explain', icon: Lightbulb, label: 'Explain', color: 'from-yellow-400 to-orange-500' },
    { id: 'creative', icon: Palette, label: 'Creative', color: 'from-pink-400 to-purple-500' },
    { id: 'code', icon: Code, label: 'Code Help', color: 'from-green-400 to-blue-500' },
    { id: 'analyze', icon: BarChart3, label: 'Analyze', color: 'from-blue-400 to-indigo-500' },
    { id: 'translate', icon: Languages, label: 'Translate', color: 'from-indigo-400 to-purple-500' },
    { id: 'summarize', icon: FileText, label: 'Summarize', color: 'from-purple-400 to-pink-500' }
  ];

  return (
    <div className="mx-4 mt-4 card-modern animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white hover-scale"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover-lift group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
              <action.icon size={24} className="text-white" />
            </div>
            <span className="text-sm font-medium text-white/90">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}