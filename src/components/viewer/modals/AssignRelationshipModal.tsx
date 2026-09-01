import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, Plus, Check, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Activity, RelationshipType } from '../../../types/p6';

interface AssignRelationshipModalProps {
  isOpen: boolean;
  mode: 'predecessor' | 'successor';
  currentActivity: Activity;
  allActivities: Activity[];
  existingRelationshipActivityIds: Set<string>;
  onAssign: (selectedActId: string, relType: RelationshipType, lagHours: number) => void;
  onClose: () => void;
}

export const AssignRelationshipModal: React.FC<AssignRelationshipModalProps> = ({
  isOpen,
  mode,
  currentActivity,
  allActivities,
  existingRelationshipActivityIds,
  onAssign,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActId, setSelectedActId] = useState<string>('');
  const [relType, setRelType] = useState<RelationshipType>('FS');
  const [lagDays, setLagDays] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'Not Started' | 'In Progress'>('ALL');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedActId('');
      setRelType('FS');
      setLagDays(0);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Filter available candidate activities
  const candidateActivities = useMemo(() => {
    return allActivities.filter(a => {
      // Exclude self
      if (a.activityId === currentActivity.activityId) return false;
      // Exclude already existing relationships
      if (existingRelationshipActivityIds.has(a.activityId)) return false;
      return true;
    });
  }, [allActivities, currentActivity.activityId, existingRelationshipActivityIds]);

  // Filtered by search & status
  const filteredActivities = useMemo(() => {
    let list = candidateActivities;

    if (statusFilter === 'CRITICAL') {
      list = list.filter(a => a.isCritical);
    } else if (statusFilter !== 'ALL') {
      list = list.filter(a => a.status === statusFilter);
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      a =>
        a.activityId.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.assignedResource && a.assignedResource.toLowerCase().includes(q)) ||
        a.wbsId.toLowerCase().includes(q)
    );
  }, [candidateActivities, searchQuery, statusFilter]);

  // Set default selected if list changes
  useEffect(() => {
    if (filteredActivities.length > 0 && (!selectedActId || !filteredActivities.some(a => a.activityId === selectedActId))) {
      setSelectedActId(filteredActivities[0].activityId);
    }
  }, [filteredActivities, selectedActId]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedActId) return;
    onAssign(selectedActId, relType, lagDays * 8);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && selectedActId) {
      handleConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Assign {mode === 'predecessor' ? 'Predecessor' : 'Successor'}</span>
              <span className="text-slate-400 font-normal">to</span>
              <span className="bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded text-xs">
                {currentActivity.activityId}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-lg">
              {currentActivity.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Status Filters */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Activity ID (e.g. A1020), Activity Name, or Resource..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {(['ALL', 'CRITICAL', 'Not Started', 'In Progress'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    statusFilter === f
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'ALL' ? 'All Activities' : f === 'CRITICAL' ? '🔥 Critical' : f}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              {filteredActivities.length} candidate{filteredActivities.length === 1 ? '' : 's'} available
            </span>
          </div>
        </div>

        {/* Search Results Table */}
        <div className="flex-1 overflow-y-auto max-h-72 p-2">
          {filteredActivities.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-medium">No matching activities found</p>
              {searchQuery && (
                <p className="text-[11px] text-slate-400">
                  Try adjusting your search keywords or filter pills above.
                </p>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 text-[11px]">
                  <th className="py-2 px-3 w-10 text-center"></th>
                  <th className="py-2 px-3 w-24">Activity ID</th>
                  <th className="py-2 px-3">Activity Name</th>
                  <th className="py-2 px-3 w-24 text-right">Planned (d)</th>
                  <th className="py-2 px-3 w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivities.map(act => {
                  const isSelected = selectedActId === act.activityId;
                  return (
                    <tr
                      key={act.activityId}
                      onClick={() => setSelectedActId(act.activityId)}
                      onDoubleClick={() => {
                        setSelectedActId(act.activityId);
                        handleConfirm();
                      }}
                      className={`cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-blue-50/80 font-medium text-blue-900'
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="radio"
                          name="selectedActivity"
                          checked={isSelected}
                          onChange={() => setSelectedActId(act.activityId)}
                          className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600">
                        {act.activityId}
                      </td>
                      <td className="py-2 px-3 truncate max-w-xs" title={act.name}>
                        {act.name}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {act.duration.plannedDuration / 8}d
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            act.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : act.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Relationship Logic & Lag Controls Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {/* Relationship Type */}
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">Type:</label>
              <select
                value={relType}
                onChange={e => setRelType(e.target.value as RelationshipType)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="FS">FS (Finish to Start)</option>
                <option value="SS">SS (Start to Start)</option>
                <option value="FF">FF (Finish to Finish)</option>
                <option value="SF">SF (Start to Finish)</option>
              </select>
            </div>

            {/* Lag in Days */}
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">Lag (Days):</label>
              <input
                type="number"
                value={lagDays}
                onChange={e => setLagDays(parseFloat(e.target.value) || 0)}
                className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-slate-800 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full cursor-pointer hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedActId}
              className="flex items-center gap-1.5 px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full shadow-md shadow-blue-500/20 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign {mode === 'predecessor' ? 'Predecessor' : 'Successor'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
