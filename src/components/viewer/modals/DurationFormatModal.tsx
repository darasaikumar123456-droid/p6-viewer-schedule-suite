import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { DurationUnit } from '../../../types/p6';

interface DurationFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: DurationUnit;
  onSave: (unit: DurationUnit) => void;
}

export const DurationFormatModal: React.FC<DurationFormatModalProps> = ({
  isOpen,
  onClose,
  unit,
  onSave,
}) => {
  if (!isOpen) return null;

  const [selectedUnit, setSelectedUnit] = useState<DurationUnit>(unit);

  const options: { id: DurationUnit; label: string }[] = [
    { id: 'h', label: 'Hours (h)' },
    { id: 'd', label: 'Days (d)' },
    { id: 'w', label: 'Weeks (w)' },
    { id: 'm', label: 'Months (m)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-2 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Duration Format</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the time unit to display all durations in the Gantt chart.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {options.map(opt => (
              <label
                key={opt.id}
                onClick={() => setSelectedUnit(opt.id)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="durationUnit"
                  value={opt.id}
                  checked={selectedUnit === opt.id}
                  onChange={() => setSelectedUnit(opt.id)}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-800">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              The conversion uses project-specific calendar settings (work hours per day, days per week/month).
            </p>
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
            onClick={() => {
              onSave(selectedUnit);
              onClose();
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-500/20 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
