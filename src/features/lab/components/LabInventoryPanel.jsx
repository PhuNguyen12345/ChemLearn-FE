import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DraggableItem from './DraggableItem';
import { FILTER_TABS } from '../data/chemicalMappings';
import { ITEM_TYPE, PHYSICAL_STATE } from '../data/constants';

/**
 * LabInventoryPanel – Right sidebar
 * Displays vertical filter tabs + search bar + item grid/list.
 * Props:
 *   filtered      – pre-filtered+searched array of inventory items
 *   searchQuery   – current search string
 *   onSearchChange– callback(value) for search input change
 *   sidebarView   – 'grid' | 'list'
 *   onViewToggle  – callback to toggle grid/list
 *   activeFilter  – currently selected filter tab id
 *   onFilterChange– callback(tabId) when a filter tab is clicked
 *   isOpen        – whether the panel is expanded
 *   onToggle      – callback to toggle open/closed
 */
const LabInventoryPanel = ({
  filtered = [],
  searchQuery = '',
  onSearchChange,
  sidebarView = 'grid',
  onViewToggle,
  activeFilter = 'ALL',
  onFilterChange,
  isOpen,
  onToggle,
}) => {
  return (
    <div style={{ width: isOpen ? '450px' : '0', transition: 'width 0.3s ease', backgroundColor: '#f8fafc', borderLeft: '2px solid #e2e8f0', display: 'flex', position: 'relative', flexShrink: 0, zIndex: 50 }}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -left-8 top-6 w-8 h-12 bg-white border border-slate-200 border-r-0 rounded-l-lg flex items-center justify-center cursor-pointer shadow-sm text-slate-500 hover:text-blue-500 z-50"
      >
        {isOpen ? '▶' : '◀'}
      </button>

      <div style={{ display: isOpen ? 'flex' : 'none', width: '100%', height: '100%' }}>
        {/* Vertical filter tabs */}
        <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 shrink-0 shadow-sm z-20">
          <TooltipProvider delayDuration={100}>
            {FILTER_TABS.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFilterChange(tab.id)}
                    className={`w-14 h-14 rounded-xl transition-all duration-200 ${
                      activeFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 hover:bg-blue-500'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {tab.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="font-semibold bg-white text-slate-800 border border-slate-200 shadow-sm text-base px-4 py-2.5">
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Inventory content */}
        <div className="flex-1 bg-slate-50 flex flex-col h-full border-l-2 border-slate-200 overflow-hidden box-border">
          {/* Search bar */}
          <div className="p-5 border-b border-slate-200 bg-white shadow-sm z-10">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm dụng cụ..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <button
                onClick={onViewToggle}
                className="p-2 aspect-square bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {sidebarView === 'grid' ? '☰' : '▦'}
              </button>
            </div>
          </div>

          {/* Item groups */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', boxSizing: 'border-box' }} className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bình phản ứng</h4>
              <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {filtered.filter(i => i.type === ITEM_TYPE.CONTAINER).map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dụng cụ</h4>
              <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {filtered.filter(i => i.type === ITEM_TYPE.EQUIPMENT).map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chất lỏng</h4>
              <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {filtered.filter(i => i.state === PHYSICAL_STATE.LIQUID).map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chất rắn</h4>
              <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {filtered.filter(i => i.state === PHYSICAL_STATE.SOLID).map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabInventoryPanel;
