import React, { useState } from 'react';
import { X, Maximize2, GripVertical, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { GroupRule } from '../../../types/p6';

interface GroupingModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupRules: GroupRule[];
  onSave: (rules: GroupRule[]) => void;
}

export const GroupingModal: React.FC<GroupingModalProps> = ({
  isOpen,
  onClose,
  groupRules,
  onSave,
}) => {
  if (!isOpen) return null;

  const [rules, setRules] = useState<GroupRule[]>(
    groupRules.length > 0
      ? groupRules
      : [{ id: 'GR-1', groupBy: 'WBS', indent: true, toLevel: 20 }]
  );

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: `GR-${Date.now()}`,
        groupBy: 'Status',
        indent: true,
        toLevel: 5,
      },
    ]);
  };

  const removeRule = (id: string) => {
    if (rules.length <= 1) return;
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<GroupRule>) => {
    setRules(rules.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleSave = () => {
    onSave(rules);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Groups</h2>
          <div className="flex items-center gap-2 text-slate-400">
            <button className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="p-6 pt-0 flex-1 overflow-y-auto">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-blue-600 font-semibold">
                  <th className="w-10 py-3 px-3"></th>
                  <th className="py-3 px-4">Group by</th>
                  <th className="py-3 px-4 text-center">Indent</th>
                  <th className="py-3 px-4">To level</th>
                  <th className="py-3 px-4">Group Interval</th>
                  <th className="w-10 py-3 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400">
                      <GripVertical className="w-4 h-4 cursor-grab" />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="relative">
                        <select
                          value={rule.groupBy}
                          onChange={e =>
                            updateRule(rule.id, {
                              groupBy: e.target.value as any,
                            })
                          }
                          className="w-full appearance-none bg-transparent border-b border-slate-200 py-1 pr-6 font-medium text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                        >
                          <option value="WBS">WBS</option>
                          <option value="Status">Status</option>
                          <option value="Activity Type">Activity Type</option>
                          <option value="Resource">Resource</option>
                          <option value="Calendar">Calendar</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rule.indent}
                        onChange={e =>
                          updateRule(rule.id, { indent: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="relative w-20">
                        <select
                          value={rule.toLevel}
                          onChange={e =>
                            updateRule(rule.id, {
                              toLevel: parseInt(e.target.value),
                            })
                          }
                          className="w-full appearance-none bg-transparent border-b border-slate-200 py-1 pr-6 font-medium text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                        >
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={rule.groupInterval || ''}
                        onChange={e =>
                          updateRule(rule.id, { groupInterval: e.target.value })
                        }
                        placeholder=""
                        className="w-full bg-transparent border-b border-slate-200 py-1 text-slate-800 focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {rules.length > 1 && (
                        <button
                          onClick={() => removeRule(rule.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <button
              onClick={addRule}
              className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors shadow-2xs"
              title="Add Grouping Rule"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex items-center justify-end gap-3 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-500/20 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
