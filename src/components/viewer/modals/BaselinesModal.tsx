import React from 'react';
import { X, Layers, Check } from 'lucide-react';
import { BaselineRevision } from '../../../types/p6';

interface BaselinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  baselines: BaselineRevision[];
  selectedBaselineNumber: number | null;
  onSelectBaseline: (rev: number | null) => void;
}

export const BaselinesModal: React.FC<BaselinesModalProps> = ({
  isOpen,
  onClose,
  projectName,
  baselines,
  selectedBaselineNumber,
  onSelectBaseline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Baselines: {projectName || 'Project Training'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center justify-center text-center">
          {baselines.length === 0 ? (
            <div className="space-y-4 max-w-xs">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No other versions available</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Baselines compare the current schedule against an earlier revision. Upload a newer version of this schedule to start using baselines.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <span className="text-xs font-semibold text-slate-700 block text-left">
                Select Baseline Revision to Compare:
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-left">
                <div
                  onClick={() => onSelectBaseline(null)}
                  className={`p-3 text-xs flex items-center justify-between cursor-pointer ${
                    selectedBaselineNumber === null ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>None (Current Only)</span>
                  {selectedBaselineNumber === null && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                {baselines.map(b => (
                  <div
                    key={b.revisionNumber}
                    onClick={() => onSelectBaseline(b.revisionNumber)}
                    className={`p-3 text-xs flex items-center justify-between cursor-pointer ${
                      selectedBaselineNumber === b.revisionNumber
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800">{b.name} (Rev {b.revisionNumber})</span>
                      <span className="text-slate-400 block text-[10px]">{b.uploadedAt}</span>
                    </div>
                    {selectedBaselineNumber === b.revisionNumber && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex items-center justify-end border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
