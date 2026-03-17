import React, { useState } from 'react';
import { Search, Plus, Beaker, MoreVertical, Edit2, Trash, Copy } from 'lucide-react';

const mockLabs = [
  { id: '1', title: 'Acid-Base Titration', lastEdited: '2 hours ago', thumbnail: null },
  { id: '2', title: 'Exothermic Reactions 101', lastEdited: 'Yesterday', thumbnail: null },
  { id: '3', title: 'Properties of Metals', lastEdited: '3 days ago', thumbnail: null },
  { id: '4', title: 'My First Experiment', lastEdited: '1 week ago', thumbnail: null },
];

const LabDashboard = ({ onOpenLab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const filteredLabs = mockLabs.filter(lab => 
    lab.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-y-auto">
      {/* Dashboard Header */}
      <div className="bg-white px-8 py-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Experiments</h1>
        <p className="text-slate-500 mt-2 font-medium">Create, manage, and revisit your virtual lab experiments.</p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search experiments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            />
          </div>
          
          <button 
            onClick={() => onOpenLab('new')}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-5 h-5" />
            Create New Lab
          </button>
        </div>
      </div>

      {/* Grid Area */}
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Create New Card (Optional, adds to Tinkercad feel) */}
          <div 
            onClick={() => onOpenLab('new')}
            className="group bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm flex flex-col items-center justify-center p-6 cursor-pointer transition-all aspect-[4/3]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-600 group-hover:text-indigo-700">New Experiment</h3>
          </div>

          {/* Existing Lab Cards */}
          {filteredLabs.map((lab) => (
            <div 
              key={lab.id} 
              onClick={() => onOpenLab(lab.id)}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col overflow-hidden relative"
            >
              {/* Thumbnail Area */}
              <div className="w-full aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <Beaker className="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors"></div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col flex-1 relative">
                <h3 className="font-bold text-slate-800 text-lg truncate pr-8" title={lab.title}>{lab.title}</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">Edited {lab.lastEdited}</p>

                {/* Settings Dropdown Trigger */}
                <button 
                  onClick={(e) => toggleMenu(e, lab.id)}
                  className="absolute right-3 top-3 p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {/* Popover Menu */}
                {activeMenuId === lab.id && (
                  <div className="absolute right-4 top-10 bg-white border border-slate-200 shadow-lg rounded-xl flex flex-col py-1 z-10 w-36 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 text-left w-full" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}>
                      <Edit2 className="w-4 h-4" /> Rename
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 text-left w-full" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}>
                      <Copy className="w-4 h-4" /> Duplicate
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 text-left w-full" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}>
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
