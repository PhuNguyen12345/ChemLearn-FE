import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DraggableItem from './DraggableItem';
import { FILTER_TABS } from '../data/chemicalMappings';
import { ITEM_TYPE, PHYSICAL_STATE } from '../data/constants';

/**
 * LabInventoryPanel – inventory tray/sidebar
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
  placement = 'side',
  onItemSelect,
}) => {
  const isBottom = placement === 'bottom';
  const groups = [
    { title: 'Bình phản ứng', items: filtered.filter(i => i.type === ITEM_TYPE.CONTAINER) },
    { title: 'Dụng cụ', items: filtered.filter(i => i.type === ITEM_TYPE.EQUIPMENT) },
    { title: 'Chất lỏng', items: filtered.filter(i => i.state === PHYSICAL_STATE.LIQUID) },
    { title: 'Chất rắn', items: filtered.filter(i => i.state === PHYSICAL_STATE.SOLID) },
  ];
  const activeLabel = FILTER_TABS.find((tab) => tab.id === activeFilter)?.label || 'Kết quả';
  const visibleGroups = activeFilter === 'ALL'
    ? groups.filter((group) => group.items.length > 0)
    : [{ title: activeLabel, items: filtered }];
  const handleHorizontalWheel = (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaY;
  };

  if (isBottom) {
    return (
      <div className={`${isOpen ? 'h-56 md:h-60' : 'h-12'} w-full shrink-0 bg-slate-50 border-t-2 border-slate-200 transition-all duration-300 relative z-50 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]`}>
        <button
          onClick={onToggle}
          className="absolute -top-8 left-1/2 -translate-x-1/2 h-8 px-4 bg-white border border-slate-200 border-b-0 rounded-t-xl flex items-center justify-center cursor-pointer shadow-sm text-xs font-black text-slate-500 hover:text-blue-500 z-50"
        >
          {isOpen ? 'Thu gọn kho' : 'Mở kho dụng cụ'}
        </button>

        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2">
            <TooltipProvider delayDuration={100}>
              <div className="flex shrink-0 items-center gap-1 overflow-x-auto" onWheel={handleHorizontalWheel}>
                {FILTER_TABS.map((tab) => (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onFilterChange(tab.id)}
                        className={`h-9 w-9 rounded-xl transition-all duration-200 ${
                          activeFilter === tab.id
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {tab.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-semibold bg-white text-slate-800 border border-slate-200 shadow-sm">
                      {tab.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>

            <input
              type="text"
              placeholder="Tìm dụng cụ..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="min-w-28 flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <button
              onClick={onViewToggle}
              className="h-9 w-9 shrink-0 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {sidebarView === 'grid' ? '☰' : '▦'}
            </button>
          </div>

          {isOpen && (
            <div className="flex-1 overflow-y-auto overscroll-y-contain px-3 py-3">
              <div className="space-y-4">
                {visibleGroups.map((group) => (
                  <section key={group.title}>
                    <h4 className="mb-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">{group.title}</h4>
                    {group.items.length > 0 ? (
                      <div className={`grid gap-2 ${sidebarView === 'grid' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {group.items.map(item => (
                          <DraggableItem
                            key={item.id}
                            item={item}
                            viewMode={sidebarView}
                            compact
                            disableDrag={Boolean(onItemSelect)}
                            onClick={() => onItemSelect?.(item)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-bold text-slate-400">
                        Không có dụng cụ phù hợp
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
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
            {visibleGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{group.title}</h4>
                {group.items.length > 0 ? (
                  <div style={{ display: sidebarView === 'grid' ? 'grid' : 'flex', flexDirection: sidebarView === 'list' ? 'column' : 'row', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {group.items.map(item => <DraggableItem key={item.id} item={item} viewMode={sidebarView} />)}
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-bold text-slate-400">
                    Không có dụng cụ phù hợp
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabInventoryPanel;
