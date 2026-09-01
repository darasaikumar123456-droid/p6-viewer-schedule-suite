import React from 'react';
import { X, Folder } from 'lucide-react';

interface LegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegendModal: React.FC<LegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const legendItems = [
    { label: 'Project', icon: <Folder className="w-4 h-4 text-blue-600 fill-blue-600" /> },
    {
      label: 'Task Duration',
      icon: <div className="w-7 h-2.5 bg-gradient-to-r from-lime-300 to-lime-500 rounded-xs" />,
    },
    {
      label: 'End Only Task',
      icon: (
        <div className="w-5 h-2.5 border-l-2 border-t-2 border-b-2 border-lime-600 rounded-l-xs" />
      ),
    },
    {
      label: 'Start Only Task',
      icon: (
        <div className="w-5 h-2.5 border-r-2 border-t-2 border-b-2 border-lime-600 rounded-r-xs" />
      ),
    },
    {
      label: 'Gradient Milestone',
      icon: <div className="w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rotate-45 rounded-2xs" />,
    },
    {
      label: 'WBS',
      icon: (
        <div className="w-7 h-3 relative">
          <div className="w-full h-1.5 bg-slate-500 rounded-xs" />
          <div className="absolute left-0 bottom-0 w-1 h-2 bg-slate-500" />
          <div className="absolute right-0 bottom-0 w-1 h-2 bg-slate-500" />
        </div>
      ),
    },
    {
      label: 'Critical Task',
      icon: <div className="w-7 h-3 bg-red-500 rounded-xs" />,
    },
    {
      label: 'Actual Task',
      icon: <div className="w-7 h-3 bg-sky-600 rounded-xs" />,
    },
    {
      label: 'Remaining Task',
      icon: <div className="w-7 h-3 bg-lime-500 rounded-xs" />,
    },
    {
      label: 'Level of Efforts',
      icon: <div className="w-7 h-3 bg-green-800 rounded-xs" />,
    },
    {
      label: 'Critical Milestone',
      icon: <div className="w-3 h-3 bg-red-500 rotate-45 rounded-2xs" />,
    },
    {
      label: 'Actual Milestone',
      icon: <div className="w-3 h-3 bg-sky-600 rotate-45 rounded-2xs" />,
    },
    {
      label: 'Remaining Milestone',
      icon: <div className="w-3 h-3 bg-lime-500 rotate-45 rounded-2xs" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Legend</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <span className="text-xs font-bold text-slate-900 block mb-3">Phases</span>
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
            {legendItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-8 flex items-center justify-center shrink-0">{item.icon}</div>
                <span className="text-xs font-medium text-slate-800 truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
