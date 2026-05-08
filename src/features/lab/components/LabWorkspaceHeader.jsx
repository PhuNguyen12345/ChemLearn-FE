import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, User, Edit3, Trash2, Save, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLabStore } from '../stores/useLabStore';

const LabWorkspaceHeader = ({ 
  onBack, 
  titleText = "Untitled Experiment", 
  saveState = 'idle', 
  onSaveClick, 
  onResetClick,
  labType = 'PREMADE',
  formattedTime = null,
  onSubmitClick
}) => {
  const [title, setTitle] = useState(titleText);
  const [isEditing, setIsEditing] = useState(false);
  const { serializeLabState, clearWorkspace, resetToTemplate } = useLabStore();
  const score = useLabStore(state => state.progress?.score || 0);
  const maxScore = useLabStore(state => state.metadata?.max_score || 50);
  const percentage = Math.min((score / maxScore) * 100, 100);
  const isFinished = percentage === 100;

  const handleTitleSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="h-14 w-full bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 z-50 shrink-0 relative">
      
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-2 w-1/3">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-2 group"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-bold text-sm hidden sm:block">Dashboard</span>
        </button>
        <div className="h-6 w-[2px] bg-slate-200 mx-1 rounded-full hidden sm:block"></div>
        <div className="flex items-center">
          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={handleTitleSubmit}
              className="text-base sm:text-lg font-bold text-slate-800 bg-slate-50 border-b-2 border-indigo-500 focus:outline-none px-2 py-0.5 rounded-t-md min-w-[200px]"
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-2 cursor-pointer px-3 py-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate max-w-[200px] xl:max-w-[300px]">{title}</h2>
              <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
            </div>
          )}
        </div>
      </div>

      {/* Center: Dynamic Content based on labType */}
      <div className="flex items-center justify-center w-1/3">
        {labType === 'PREMADE' && (
          <div className="w-full max-w-sm flex flex-col items-center gap-1">
            <div className="flex items-center justify-between w-full text-xs font-bold text-slate-500">
              <span className="uppercase tracking-wider">Tiến độ Lab</span>
              <span className={`transition-colors duration-300 ${isFinished ? "text-amber-500" : "text-blue-600"} flex items-center gap-1`}>
                {isFinished && "⭐"} {score}/{maxScore} EXP
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-200 rounded-full p-0.5 shadow-inner relative overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out relative ${
                  isFinished 
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]' 
                    : 'bg-gradient-to-b from-blue-400 to-blue-600'
                }`}
                style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '1.5rem' : '0' }}
              >
                {/* Glossy Jelly Highlight overlay */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 rounded-t-full" />
              </div>
            </div>
          </div>
        )}

        {labType === 'ASSIGNMENT' && formattedTime && (
          <div className="flex flex-col items-center justify-center bg-red-50 border border-red-200 px-4 py-1.5 rounded-lg shadow-sm">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-0.5">Thời gian</span>
            <span className="text-xl font-mono font-bold text-red-600 leading-none">{formattedTime}</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Cloud Save & Avatar */}
      <div className="flex items-center justify-end gap-3 w-[45%]">
        <Button 
          variant="outline" 
          className="text-destructive hover:bg-red-50 hover:text-red-600 border-slate-200 h-9 px-3" 
          onClick={clearWorkspace}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Clear Desk
        </Button>

        <Button 
          variant="outline" 
          className="text-blue-600 hover:bg-blue-50 border-blue-200 h-9 px-3 hidden md:flex" 
          onClick={onResetClick}
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Reset Lab
        </Button>

        <div className="flex items-center gap-2 border-l pl-3 ml-1 border-slate-200">
          {/* Auto-save indicator for ASSIGNMENT mode */}
          {labType === 'ASSIGNMENT' && (
            <div className="text-xs font-medium min-w-[70px] text-right hidden sm:block">
              {saveState === 'saving' && <span className="text-slate-500 animate-pulse">Đang lưu...</span>}
              {saveState === 'saved' && <span className="text-emerald-600">Đã lưu</span>}
            </div>
          )}

          {labType === 'ASSIGNMENT' ? (
            <Button
              variant="default"
              className="h-9 px-6 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-sm min-w-[120px]"
              onClick={onSubmitClick}
              disabled={saveState === 'saving'}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Nộp bài
            </Button>
          ) : (
            <Button
              variant="default"
              className={`h-9 px-4 transition-all duration-300 min-w-[100px] ${
                saveState === 'saved' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={onSaveClick}
              disabled={saveState === 'saving'}
            >
              {saveState === 'saving' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : saveState === 'saved' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save
                </>
              )}
            </Button>
          )}
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
