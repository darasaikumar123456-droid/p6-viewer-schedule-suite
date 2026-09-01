import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  Activity,
  Relationship,
  ActivityStatus,
  RelationshipType,
  ActivityType,
} from '../../types/p6';
import { AssignRelationshipModal } from './modals/AssignRelationshipModal';

interface ActivityDetailDrawerProps {
  activity: Activity | null;
  allActivities: Activity[];
  relationships: Relationship[];
  onClose: () => void;
  onUpdateActivity: (updated: Activity) => void;
  onAddRelationship: (predId: string, succId: string, type: RelationshipType, lag: number) => void;
  onUpdateRelationship: (relId: string, updates: Partial<Relationship>) => void;
  onDeleteRelationship: (relId: string) => void;
  onSelectActivity: (actId: string) => void;
}

export const ActivityDetailDrawer: React.FC<ActivityDetailDrawerProps> = ({
  activity,
  allActivities,
  relationships,
  onClose,
  onUpdateActivity,
  onAddRelationship,
  onUpdateRelationship,
  onDeleteRelationship,
  onSelectActivity,
}) => {
  if (!activity) return null;

  const [activeTab, setActiveTab] = useState<'General' | 'Status' | 'Relationships'>('Relationships');
  const [assignModalMode, setAssignModalMode] = useState<'predecessor' | 'successor' | null>(null);

  const predecessors = relationships.filter(r => r.succActivityId === activity.activityId);
  const successors = relationships.filter(r => r.predActivityId === activity.activityId);

  const existingPredIds = React.useMemo(() => new Set(predecessors.map(r => r.predActivityId)), [predecessors]);
  const existingSuccIds = React.useMemo(() => new Set(successors.map(r => r.succActivityId)), [successors]);

  const getActivityById = (id: string) => allActivities.find(a => a.activityId === id);

  return (
    <div className="bg-white border-t-2 border-blue-500 shadow-xl flex flex-col h-72 z-30 transition-all duration-200">
      {/* Top Banner */}
      <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Activity ID:</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold border border-blue-200">
              {activity.activityId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Activity Name:</span>
            <input
              type="text"
              value={activity.name}
              onChange={e => onUpdateActivity({ ...activity, name: e.target.value })}
              className="bg-blue-50/60 hover:bg-blue-50 focus:bg-white text-blue-800 font-medium px-2 py-0.5 rounded border border-blue-200 focus:outline-none focus:border-blue-500 text-xs w-60"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Type:</span>
            <span className="text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded font-medium">
              {activity.activityType}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          title="Close details drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center px-6 border-b border-slate-200 bg-white gap-2">
        {(['General', 'Status', 'Relationships'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab}</span>
            {tab === 'Relationships' && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {predecessors.length + successors.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30">
        {/* General Tab */}
        {activeTab === 'General' && (
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="font-bold text-blue-600 block border-b border-slate-100 pb-1">Identification</span>
              <div>
                <label className="text-[11px] text-slate-500 block">Activity ID</label>
                <input
                  type="text"
                  value={activity.activityId}
                  disabled
                  className="w-full bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block">Activity Name</label>
                <input
                  type="text"
                  value={activity.name}
                  onChange={e => onUpdateActivity({ ...activity, name: e.target.value })}
                  className="w-full bg-white text-slate-800 px-2 py-1 rounded border border-slate-300 text-xs focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="font-bold text-blue-600 block border-b border-slate-100 pb-1">Activity Classification</span>
              <div>
                <label className="text-[11px] text-slate-500 block">Activity Type</label>
                <select
                  value={activity.activityType}
                  onChange={e => onUpdateActivity({ ...activity, activityType: e.target.value as ActivityType })}
                  className="w-full bg-white text-slate-800 px-2 py-1 rounded border border-slate-300 text-xs"
                >
                  <option value="Task Dependent">Task Dependent</option>
                  <option value="Resource Dependent">Resource Dependent</option>
                  <option value="Level of Effort">Level of Effort</option>
                  <option value="Start Milestone">Start Milestone</option>
                  <option value="Finish Milestone">Finish Milestone</option>
                  <option value="WBS Summary">WBS Summary</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block">Assigned Resource</label>
                <input
                  type="text"
                  value={activity.assignedResource || ''}
                  onChange={e => onUpdateActivity({ ...activity, assignedResource: e.target.value })}
                  placeholder="e.g. Civil Contractor, Lead Engineer"
                  className="w-full bg-white text-slate-800 px-2 py-1 rounded border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="font-bold text-blue-600 block border-b border-slate-100 pb-1">Schedule Diagnostics</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-500 block">Critical Path</span>
                  <span className={`font-bold ${activity.isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                    {activity.isCritical ? 'Yes (Critical)' : 'No (Non-Critical)'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-500 block">Total Float</span>
                  <span className="font-bold font-mono text-slate-800">
                    {(activity.duration.totalFloat / 8).toFixed(1)} d
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-500 block">Free Float</span>
                  <span className="font-bold font-mono text-slate-800">
                    {((activity.duration.freeSlack || 0) / 8).toFixed(1)} d
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-500 block">Calendar ID</span>
                  <span className="font-bold font-mono text-slate-800">{activity.calendarId}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'Status' && (
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="font-bold text-blue-600 block border-b border-slate-100 pb-1">Status & Progress</span>
              <div>
                <label className="text-[11px] text-slate-500 block">Status</label>
                <select
                  value={activity.status}
                  onChange={e => {
                    const newStatus = e.target.value as ActivityStatus;
                    onUpdateActivity({
                      ...activity,
                      status: newStatus,
                      progress: {
                        ...activity.progress,
                        activityPctComplete: newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 50 : 0,
                      },
                    });
                  }}
                  className="w-full bg-white text-slate-800 px-2 py-1 rounded border border-slate-300 text-xs"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>% Complete</span>
                  <span className="font-bold text-blue-600">{activity.progress.activityPctComplete}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activity.progress.activityPctComplete}
                  onChange={e =>
                    onUpdateActivity({
                      ...activity,
                      progress: { ...activity.progress, activityPctComplete: parseInt(e.target.value) },
                    })
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="font-bold text-blue-600 block border-b border-slate-100 pb-1">Dates</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block">Early Start</label>
                  <input
                    type="date"
                    value={activity.dates.earlyStart || ''}
                    disabled
                    className="w-full bg-slate-50 text-slate-700 px-1.5 py-1 rounded border border-slate-200 text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Early Finish</label>
                  <input
                    type="date"
                    value={activity.dates.earlyFinish || ''}
                    disabled
                    className="w-full bg-slate-50 text-slate-700 px-1.5 py-1 rounded border border-slate-200 text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Actual Start</label>
                  <input
                    type="date"
                    value={activity.dates.actualStart || ''}
                    onChange={e =>
                      onUpdateActivity({
                        ...activity,
                        dates: { ...activity.dates, actualStart: e.target.value || null },
                      })
                    }
                    className="w-full bg-white text-slate-800 px-1.5 py-1 rounded border border-slate-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Actual Finish</label>
                  <input
                    type="date"
                    value={activity.dates.actualFinish || ''}
                    onChange={e =>
                      onUpdateActivity({
                        ...activity,
                        dates: { ...activity.dates, actualFinish: e.target.value || null },
                      })
                    }
                    className="w-full bg-white text-slate-800 px-1.5 py-1 rounded border border-slate-300 text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="font-bold text-blue-600 block border-b border-slate-100 pb-1">Durations (Days)</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="text-[10px] text-slate-500 block">Planned (d)</label>
                  <input
                    type="number"
                    value={activity.duration.plannedDuration / 8}
                    onChange={e =>
                      onUpdateActivity({
                        ...activity,
                        duration: { ...activity.duration, plannedDuration: (parseFloat(e.target.value) || 0) * 8 },
                      })
                    }
                    className="w-full bg-white text-slate-800 px-2 py-1 rounded border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Remaining (d)</label>
                  <input
                    type="number"
                    value={activity.duration.remainingDuration / 8}
                    onChange={e =>
                      onUpdateActivity({
                        ...activity,
                        duration: { ...activity.duration, remainingDuration: (parseFloat(e.target.value) || 0) * 8 },
                      })
                    }
                    className="w-full bg-white text-slate-800 px-2 py-1 rounded border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Relationships Tab */}
        {activeTab === 'Relationships' && (
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Predecessors Table */}
            <div className="border border-slate-200 rounded-xl p-3 flex flex-col bg-white overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600">
                  Predecessors ({predecessors.length})
                </span>
                <button
                  onClick={() => setAssignModalMode('predecessor')}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Predecessor</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {predecessors.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs italic text-slate-400">
                    No predecessors found
                  </div>
                ) : (
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 font-medium">
                        <th className="py-1 px-1">ID</th>
                        <th className="py-1 px-2">Name</th>
                        <th className="py-1 px-1">Type</th>
                        <th className="py-1 px-1">Lag</th>
                        <th className="py-1 px-1">Status</th>
                        <th className="py-1 px-1 text-center">Driving</th>
                        <th className="w-14 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {predecessors.map(rel => {
                        const predAct = getActivityById(rel.predActivityId);
                        return (
                          <tr key={rel.id} className="hover:bg-blue-50/50 group">
                            <td
                              onClick={() => onSelectActivity(rel.predActivityId)}
                              className="py-1.5 px-1 font-mono font-bold text-blue-600 hover:underline cursor-pointer"
                              title="Jump to this activity"
                            >
                              {rel.predActivityId}
                            </td>
                            <td className="py-1.5 px-2 truncate max-w-[120px]" title={predAct?.name}>
                              {predAct?.name || 'Unknown'}
                            </td>
                            <td className="py-1.5 px-1">
                              <select
                                value={rel.type}
                                onChange={e =>
                                  onUpdateRelationship(rel.id, {
                                    type: e.target.value as RelationshipType,
                                  })
                                }
                                className="bg-transparent font-semibold text-slate-800 text-[11px]"
                              >
                                <option value="FS">FS</option>
                                <option value="SS">SS</option>
                                <option value="FF">FF</option>
                                <option value="SF">SF</option>
                              </select>
                            </td>
                            <td className="py-1.5 px-1">
                              <input
                                type="number"
                                value={rel.lagHours / 8}
                                onChange={e =>
                                  onUpdateRelationship(rel.id, {
                                    lagHours: (parseFloat(e.target.value) || 0) * 8,
                                  })
                                }
                                className="w-10 bg-transparent border-b border-slate-200 text-center text-[11px]"
                                title="Lag in days"
                              />
                              <span className="text-[9px] text-slate-400">d</span>
                            </td>
                            <td className="py-1.5 px-1 text-slate-600">{predAct?.status || '-'}</td>
                            <td className="py-1.5 px-1 text-center">
                              <input
                                type="checkbox"
                                checked={rel.isDriving}
                                onChange={e =>
                                  onUpdateRelationship(rel.id, { isDriving: e.target.checked })
                                }
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                            </td>
                            <td className="py-1.5 px-1 text-right flex items-center justify-end gap-1">
                              <button
                                onClick={() => onSelectActivity(rel.predActivityId)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors cursor-pointer"
                                title={`Jump to ${rel.predActivityId}`}
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteRelationship(rel.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-all cursor-pointer"
                                title="Delete relationship"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Successors Table */}
            <div className="border border-slate-200 rounded-xl p-3 flex flex-col bg-white overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600">
                  Successors ({successors.length})
                </span>
                <button
                  onClick={() => setAssignModalMode('successor')}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Successor</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {successors.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs italic text-slate-400">
                    No successors found
                  </div>
                ) : (
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 font-medium">
                        <th className="py-1 px-1">ID</th>
                        <th className="py-1 px-2">Name</th>
                        <th className="py-1 px-1">Type</th>
                        <th className="py-1 px-1">Lag</th>
                        <th className="py-1 px-1">Status</th>
                        <th className="py-1 px-1 text-center">Driving</th>
                        <th className="w-14 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {successors.map(rel => {
                        const succAct = getActivityById(rel.succActivityId);
                        return (
                          <tr key={rel.id} className="hover:bg-blue-50/50 group">
                            <td
                              onClick={() => onSelectActivity(rel.succActivityId)}
                              className="py-1.5 px-1 font-mono font-bold text-blue-600 hover:underline cursor-pointer"
                              title="Jump to this activity"
                            >
                              {rel.succActivityId}
                            </td>
                            <td className="py-1.5 px-2 truncate max-w-[120px]" title={succAct?.name}>
                              {succAct?.name || 'Unknown'}
                            </td>
                            <td className="py-1.5 px-1">
                              <select
                                value={rel.type}
                                onChange={e =>
                                  onUpdateRelationship(rel.id, {
                                    type: e.target.value as RelationshipType,
                                  })
                                }
                                className="bg-transparent font-semibold text-slate-800 text-[11px]"
                              >
                                <option value="FS">FS</option>
                                <option value="SS">SS</option>
                                <option value="FF">FF</option>
                                <option value="SF">SF</option>
                              </select>
                            </td>
                            <td className="py-1.5 px-1">
                              <input
                                type="number"
                                value={rel.lagHours / 8}
                                onChange={e =>
                                  onUpdateRelationship(rel.id, {
                                    lagHours: (parseFloat(e.target.value) || 0) * 8,
                                  })
                                }
                                className="w-10 bg-transparent border-b border-slate-200 text-center text-[11px]"
                                title="Lag in days"
                              />
                              <span className="text-[9px] text-slate-400">d</span>
                            </td>
                            <td className="py-1.5 px-1 text-slate-600">{succAct?.status || '-'}</td>
                            <td className="py-1.5 px-1 text-center">
                              <input
                                type="checkbox"
                                checked={rel.isDriving}
                                onChange={e =>
                                  onUpdateRelationship(rel.id, { isDriving: e.target.checked })
                                }
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                            </td>
                            <td className="py-1.5 px-1 text-right flex items-center justify-end gap-1">
                              <button
                                onClick={() => onSelectActivity(rel.succActivityId)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors cursor-pointer"
                                title={`Jump to ${rel.succActivityId}`}
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteRelationship(rel.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-all cursor-pointer"
                                title="Delete relationship"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Searchable Assign Predecessor / Successor Modal */}
      {assignModalMode && (
        <AssignRelationshipModal
          isOpen={!!assignModalMode}
          mode={assignModalMode}
          currentActivity={activity}
          allActivities={allActivities}
          existingRelationshipActivityIds={
            assignModalMode === 'predecessor' ? existingPredIds : existingSuccIds
          }
          onAssign={(selectedId, type, lagHours) => {
            if (assignModalMode === 'predecessor') {
              onAddRelationship(selectedId, activity.activityId, type, lagHours);
            } else {
              onAddRelationship(activity.activityId, selectedId, type, lagHours);
            }
          }}
          onClose={() => setAssignModalMode(null)}
        />
      )}
    </div>
  );
};
