import React, { useState } from 'react';
import {
  X,
  Search,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Settings,
  AlignLeft,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Sliders,
} from 'lucide-react';
import { ColumnDefinition } from '../../../types/p6';

interface ColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDefinition[];
  allAvailableColumns: ColumnDefinition[];
  onSave: (selectedColumns: ColumnDefinition[]) => void;
}

export const ColumnsModal: React.FC<ColumnsModalProps> = ({
  isOpen,
  onClose,
  columns,
  allAvailableColumns,
  onSave,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandAll, setExpandAll] = useState(true);

  // Column definitions with width tracking
  const [selectedColItems, setSelectedColItems] = useState<ColumnDefinition[]>(() => {
    const visible = columns.filter(c => c.visible);
    return visible.map(c => ({
      ...c,
      width: c.width || (c.id === 'name' ? 280 : 110),
    }));
  });

  const [selectedAvailableId, setSelectedAvailableId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Activity Codes': true,
    'Dates': true,
    'Durations': true,
    'General': true,
    'Lists': true,
    'Percent Complete': true,
    'Work': true,
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleToggleExpandAll = () => {
    const nextState = !expandAll;
    setExpandAll(nextState);
    const updated: Record<string, boolean> = {};
    Object.keys(expandedCategories).forEach(cat => {
      updated[cat] = nextState;
    });
    setExpandedCategories(updated);
  };

  const categories = [
    'Activity Codes',
    'Dates',
    'Durations',
    'General',
    'Lists',
    'Percent Complete',
    'Work',
  ] as const;

  const handleAdd = () => {
    if (selectedAvailableId && !selectedColItems.some(c => c.id === selectedAvailableId)) {
      const colDef = allAvailableColumns.find(c => c.id === selectedAvailableId) || {
        id: selectedAvailableId,
        category: 'General',
        label: selectedAvailableId,
        visible: true,
        order: selectedColItems.length + 1,
        width: selectedAvailableId === 'name' ? 280 : 110,
      };
      setSelectedColItems([...selectedColItems, { ...colDef, visible: true, width: colDef.width || 110 }]);
    }
  };

  const handleRemove = () => {
    if (selectedRightId) {
      setSelectedColItems(selectedColItems.filter(c => c.id !== selectedRightId));
      setSelectedRightId(null);
    }
  };

  const handleUpdateWidth = (colId: string, width: number) => {
    setSelectedColItems(prev =>
      prev.map(c => (c.id === colId ? { ...c, width: Math.max(50, Math.min(800, width)) } : c))
    );
  };

  const applyPresetWidthAll = (width: number) => {
    setSelectedColItems(prev =>
      prev.map(c => ({
        ...c,
        width: c.id === 'name' ? Math.max(200, width * 1.8) : width,
      }))
    );
  };

  const handleSave = () => {
    const finalCols = selectedColItems.map((c, idx) => ({
      ...c,
      visible: true,
      order: idx + 1,
      width: c.width || (c.id === 'name' ? 280 : 110),
    }));
    onSave(finalCols);
    onClose();
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...selectedColItems];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setSelectedColItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === selectedColItems.length - 1) return;
    const newItems = [...selectedColItems];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setSelectedColItems(newItems);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Columns & Widths</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Select visible columns, adjust custom column widths (px), or pick standard presets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search columns"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-blue-500 rounded-full focus:outline-none transition-all w-52"
              />
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Width Presets Toolbar */}
        <div className="px-6 py-2 bg-slate-50 border-y border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700">Quick Width Presets:</span>
            <button
              onClick={() => applyPresetWidthAll(80)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded font-medium text-slate-600 transition-colors cursor-pointer"
            >
              Compact (80px)
            </button>
            <button
              onClick={() => applyPresetWidthAll(110)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded font-medium text-slate-600 transition-colors cursor-pointer"
            >
              Standard (110px)
            </button>
            <button
              onClick={() => applyPresetWidthAll(160)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded font-medium text-slate-600 transition-colors cursor-pointer"
            >
              Wide (160px)
            </button>
            <button
              onClick={() => applyPresetWidthAll(220)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded font-medium text-slate-600 transition-colors cursor-pointer"
            >
              Extra Wide (220px)
            </button>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            {selectedColItems.length} columns active
          </span>
        </div>

        {/* Body (Two Panes + Middle Controls) */}
        <div className="px-6 py-4 grid grid-cols-[1fr,44px,1.3fr] gap-4 flex-1 overflow-hidden min-h-[380px]">
          {/* Left Pane: Available columns */}
          <div className="border border-slate-200 rounded-xl p-3 overflow-y-auto flex flex-col bg-slate-50/40">
            <span className="text-sm font-semibold text-slate-800 mb-2 px-1">Available columns</span>
            <div className="space-y-1 flex-1">
              {categories.map(cat => {
                const catColumns = allAvailableColumns.filter(
                  c =>
                    c.category === cat &&
                    (!searchQuery || c.label.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                if (catColumns.length === 0 && searchQuery) return null;

                const isExpanded = expandedCategories[cat] ?? true;

                return (
                  <div key={cat} className="space-y-0.5">
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center gap-1.5 py-1 px-2 text-xs font-semibold text-blue-600 hover:bg-blue-50/60 rounded-md transition-colors text-left cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      <span>{cat}</span>
                    </button>

                    {isExpanded && (
                      <div className="pl-5 space-y-0.5">
                        {catColumns.map(col => {
                          const isSelected = selectedAvailableId === col.id;
                          const isAlreadyAdded = selectedColItems.some(c => c.id === col.id);
                          return (
                            <div
                              key={col.id}
                              onClick={() => setSelectedAvailableId(col.id)}
                              onDoubleClick={() => {
                                if (!isAlreadyAdded) {
                                  setSelectedColItems([
                                    ...selectedColItems,
                                    { ...col, visible: true, width: col.width || 110 },
                                  ]);
                                }
                              }}
                              className={`py-1.5 px-2 text-xs rounded-md cursor-pointer flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-blue-100 text-blue-800 font-medium'
                                  : isAlreadyAdded
                                  ? 'text-slate-400 hover:bg-slate-100'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{col.label}</span>
                              {isAlreadyAdded && (
                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                  added
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle Actions */}
          <div className="flex flex-col items-center justify-center gap-3">
            <button
              title="Reset to Default"
              onClick={() => {
                const defaults = allAvailableColumns
                  .filter(c => ['activityId', 'name', 'status', 'plannedDuration', 'earlyStart', 'earlyFinish', 'totalFloat'].includes(c.id))
                  .map(c => ({ ...c, visible: true, width: c.id === 'name' ? 280 : 110 }));
                setSelectedColItems(defaults);
              }}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              title="Add Selected"
              onClick={handleAdd}
              disabled={!selectedAvailableId || selectedColItems.some(c => c.id === selectedAvailableId)}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              title="Remove Selected"
              onClick={handleRemove}
              disabled={!selectedRightId}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Right Pane: Selected columns with Width Input Field */}
          <div className="border border-slate-200 rounded-xl p-3 overflow-y-auto flex flex-col bg-slate-50/40">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm font-semibold text-slate-800">Selected columns</span>
              <span className="text-[11px] font-semibold text-slate-500">Width (px)</span>
            </div>
            <div className="space-y-1.5 flex-1">
              {selectedColItems.map((col, index) => {
                const isSelected = selectedRightId === col.id;
                const currentW = col.width || (col.id === 'name' ? 280 : 110);

                return (
                  <div
                    key={col.id}
                    onClick={() => setSelectedRightId(col.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-xs'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab shrink-0" />
                      <span className="font-medium truncate">{col.label}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {/* Numeric Width Input */}
                      <div className="flex items-center gap-1 bg-slate-100 rounded px-1.5 py-0.5 border border-slate-200">
                        <input
                          type="number"
                          min={50}
                          max={800}
                          step={10}
                          value={currentW}
                          onChange={e => handleUpdateWidth(col.id, parseInt(e.target.value, 10) || 50)}
                          onClick={e => e.stopPropagation()}
                          className="w-12 text-right bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">px</span>
                      </div>

                      {/* Move Up / Down */}
                      <div className="flex items-center text-slate-400">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            moveUp(index);
                          }}
                          className="hover:text-blue-600 p-0.5 cursor-pointer"
                          title="Move Up"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            moveDown(index);
                          }}
                          className="hover:text-blue-600 p-0.5 cursor-pointer"
                          title="Move Down"
                        >
                          <Settings className="w-3.5 h-3.5 hover:rotate-45 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex items-center justify-between border-t border-slate-100 mt-2 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-600">Expand All Columns</span>
            <button
              type="button"
              onClick={handleToggleExpandAll}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                expandAll ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  expandAll ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
