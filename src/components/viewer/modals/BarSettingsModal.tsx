import React, { useState } from 'react';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { BarSetting } from '../../../types/p6';

interface BarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  barSettings: BarSetting[];
  projectName: string;
  onSave: (updatedBars: BarSetting[]) => void;
  onOpenWBSColorModal: () => void;
}

export const BarSettingsModal: React.FC<BarSettingsModalProps> = ({
  isOpen,
  onClose,
  barSettings,
  projectName,
  onSave,
  onOpenWBSColorModal,
}) => {
  if (!isOpen) return null;

  const [bars, setBars] = useState<BarSetting[]>(barSettings);

  const toggleBar = (id: string) => {
    setBars(prev =>
      prev.map(b => (b.id === id ? { ...b, visible: !b.visible } : b))
    );
  };

  const handleReset = () => {
    setBars(barSettings);
  };

  const handleSave = () => {
    onSave(bars);
    onClose();
  };

  const renderSampleShape = (bar: BarSetting) => {
    if (bar.shape === 'bracket') {
      return (
        <div className="w-28 h-4 relative flex items-center">
          <div className="w-full h-2 bg-slate-500 rounded-xs" />
          <div className="absolute left-0 -bottom-1 w-1.5 h-3 bg-slate-500" />
          <div className="absolute right-0 -bottom-1 w-1.5 h-3 bg-slate-500" />
        </div>
      );
    }
    if (bar.shape === 'diamond') {
      return (
        <div
          className="w-3.5 h-3.5 rotate-45 rounded-xs"
          style={{ backgroundColor: bar.color }}
        />
      );
    }
    return (
      <div
        className="w-28 h-3.5 rounded-sm shadow-xs"
        style={{ backgroundColor: bar.color }}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bar Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Split Left Nav & Right Preview) */}
        <div className="p-6 grid grid-cols-[180px,1fr] gap-6 flex-1 overflow-hidden min-h-[380px]">
          {/* Left Menu */}
          <div className="border-r border-slate-100 pr-4">
            <span className="text-sm font-bold text-slate-900">WBS</span>
            <div className="mt-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenWBSColorModal();
                }}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline py-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Color</span>
              </button>
            </div>
          </div>

          {/* Right Preview */}
          <div className="overflow-y-auto pr-2 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">Preview</span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-full text-xs font-semibold text-blue-700">
                <span>{projectName || 'Project Training'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="border border-slate-200/80 rounded-xl divide-y divide-slate-100 bg-white">
              {bars.map(bar => (
                <div
                  key={bar.id}
                  onClick={() => toggleBar(bar.id)}
                  className="p-3 px-4 flex items-center justify-between hover:bg-slate-50/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bar.visible}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-800">{bar.label}</span>
                  </div>
                  <div className="pr-4">{renderSampleShape(bar)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex items-center justify-between border-t border-slate-100 bg-white">
          <button
            onClick={handleReset}
            className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
          >
            Reset Current Version
          </button>

          <div className="flex items-center gap-3">
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
    </div>
  );
};
