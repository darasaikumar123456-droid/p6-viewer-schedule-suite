import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, RotateCcw, Maximize2 } from 'lucide-react';
import { FilterState, WBSNode, ActivityStatus } from '../../../types/p6';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  wbsNodes: WBSNode[];
  onSave: (filters: FilterState) => void;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  filterState,
  wbsNodes,
  onSave,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'General' | 'WBS' | 'Activity Codes'>('General');
  const [startDate, setStartDate] = useState(filterState.startDate || '');
  const [endDate, setEndDate] = useState(filterState.endDate || '');
  const [selectedStatuses, setSelectedStatuses] = useState<ActivityStatus[]>(filterState.statuses || []);
  const [isCriticalOnly, setIsCriticalOnly] = useState(filterState.isCriticalOnly || false);
  const [selectedWbsIds, setSelectedWbsIds] = useState<string[]>(filterState.selectedWbsIds || []);
  const [hideIfEmpty, setHideIfEmpty] = useState(filterState.hideIfEmpty ?? true);

  useEffect(() => {
    setStartDate(filterState.startDate || '');
    setEndDate(filterState.endDate || '');
    setSelectedStatuses(filterState.statuses || []);
    setIsCriticalOnly(filterState.isCriticalOnly || false);
    setSelectedWbsIds(filterState.selectedWbsIds || []);
    setHideIfEmpty(filterState.hideIfEmpty ?? true);
  }, [filterState, isOpen]);

  const statuses: { id: ActivityStatus; label: string }[] = [
    { id: 'Not Started', label: 'Not Started' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' },
  ];

  const toggleStatus = (st: ActivityStatus) => {
    if (selectedStatuses.includes(st)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== st));
    } else {
      setSelectedStatuses([...selectedStatuses, st]);
    }
  };

  const toggleWbs = (id: string) => {
    if (selectedWbsIds.includes(id)) {
      setSelectedWbsIds(selectedWbsIds.filter(w => w !== id));
    } else {
      setSelectedWbsIds([...selectedWbsIds, id]);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedStatuses(['Not Started', 'In Progress', 'Completed']);
    setIsCriticalOnly(false);
    setSelectedWbsIds([]);
    setHideIfEmpty(true);
    onSave({
      startDate: '',
      endDate: '',
      statuses: ['Not Started', 'In Progress', 'Completed'],
      isCriticalOnly: false,
      selectedWbsIds: [],
      activityCodes: {},
      hideIfEmpty: true,
    });
    onClose();
  };

  const handleSave = () => {
    onSave({
      startDate,
      endDate,
      statuses: selectedStatuses,
      isCriticalOnly,
      selectedWbsIds,
      activityCodes: {},
      hideIfEmpty,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Filters</h2>
          <div className="flex items-center gap-2 text-slate-400">
            <button
              onClick={handleClearFilters}
              title="Clear all filters"
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-red-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex items-center gap-6 border-b border-slate-100">
          {(['General', 'WBS', 'Activity Codes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {activeTab === 'General' && (
            <div className="space-y-6">
              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-blue-600">
                    Start date
                  </label>
                  <div className="flex items-center border border-blue-200 rounded-xl px-3.5 py-2.5 hover:border-blue-400 focus-within:border-blue-600 transition-colors">
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="text-xs text-slate-800 focus:outline-none w-full bg-transparent"
                    />
                    <CalendarIcon className="w-4 h-4 text-blue-500 shrink-0 pointer-events-none" />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-blue-600">
                    End date
                  </label>
                  <div className="flex items-center border border-blue-200 rounded-xl px-3.5 py-2.5 hover:border-blue-400 focus-within:border-blue-600 transition-colors">
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="text-xs text-slate-800 focus:outline-none w-full bg-transparent"
                    />
                    <CalendarIcon className="w-4 h-4 text-blue-500 shrink-0 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2.5">
                  Activity Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(st => {
                    const isSelected = selectedStatuses.includes(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleStatus(st.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsCriticalOnly(!isCriticalOnly)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isCriticalOnly
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Critical Only
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WBS' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Filter by WBS Node
                </span>
                {selectedWbsIds.length > 0 && (
                  <button
                    onClick={() => setSelectedWbsIds([])}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                )}
              </div>
              <div className="border border-slate-200 rounded-xl p-3 max-h-52 overflow-y-auto space-y-1">
                {wbsNodes.map(wbs => {
                  const isSelected = selectedWbsIds.includes(wbs.wbsId);
                  return (
                    <label
                      key={wbs.wbsId}
                      className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-800"
                      style={{ paddingLeft: `${wbs.level * 12}px` }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleWbs(wbs.wbsId)}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                      />
                      <span>{wbs.shortCode} - {wbs.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Activity Codes' && (
            <div className="text-center py-8 text-xs text-slate-400">
              No activity codes assigned to current schedule.
            </div>
          )}
        </div>

        {/* Bottom Persistent Checkbox & Footer */}
        <div className="p-6 pt-4 flex items-center justify-between border-t border-slate-100 bg-white">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hideIfEmpty}
              onChange={e => setHideIfEmpty(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-slate-700">Hide if Empty</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-500/20 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
