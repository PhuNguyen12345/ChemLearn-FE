import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, User, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LabWorkspaceHeader = ({ onBack, titleText = "Untitled Experiment" }) => {
  const [title, setTitle] = useState(titleText);
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="h-14 w-full bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 z-50 shrink-0 relative">
      
      {/* Left: Back Button & Logo */}
      <div className="flex items-center gap-2 w-1/3">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-2 group"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-bold text-sm hidden sm:block">Dashboard</span>
        </button>
      </div>

      {/* Center: Editable Title */}
      <div className="flex items-center justify-center w-1/3">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleTitleSubmit}
            className="text-lg font-bold text-center text-slate-800 bg-slate-50 border-b-2 border-indigo-500 focus:outline-none px-2 py-0.5 rounded-t-md min-w-[200px]"
          />
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="group flex items-center gap-2 cursor-pointer px-3 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <h2 className="text-lg font-bold text-slate-800 truncate max-w-[300px]">{title}</h2>
            <Edit3 className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
          </div>
        )}
      </div>

      {/* Right: Actions, Cloud Save & Avatar */}
      <div className="flex items-center justify-end gap-3 w-1/3">
        <Button 
          variant="outline" 
          className="text-destructive hover:bg-red-50 hover:text-red-600 border-slate-200 h-9 px-3" 
          onClick={() => window.dispatchEvent(new Event('clear-lab-desk'))}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Clear Desk
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 h-9">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Saved</span>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shadow-inner cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all">
          {/* Mock Avatar */}
          <User className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default LabWorkspaceHeader;
