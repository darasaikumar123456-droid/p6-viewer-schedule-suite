import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown, Folder, Minus } from 'lucide-react';
import { WBSPalette } from '../../../types/p6';

interface WBSColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  palettes: WBSPalette[];
  activePaletteId: string;
  wbsColorsEnabled: boolean;
  onSave: (paletteId: string, enabled: boolean) => void;
}

export const WBSColorModal: React.FC<WBSColorModalProps> = ({
  isOpen,
  onClose,
  palettes,
  activePaletteId,
  wbsColorsEnabled,
  onSave,
}) => {
  if (!isOpen) return null;

  const [enabled, setEnabled] = useState(wbsColorsEnabled);
  const [selectedPaletteId, setSelectedPaletteId] = useState(activePaletteId);
  const [showPalettes, setShowPalettes] = useState(true);

  const activePalette = palettes.find(p => p.id === selectedPaletteId) || palettes[0];

  const handleReset = () => {
    setSelectedPaletteId('default');
    setEnabled(true);
  };

  const handleSave = () => {
    onSave(selectedPaletteId, enabled);
    onClose();
  };

  // Generate 15 sample preview rows cycling through the palette
  const previewRows = Array.from({ length: 15 }, (_, i) => {
    const level = i + 1;
    const color = activePalette.colors[(level - 1) % activePalette.colors.length];
    return {
      level,
      name: `Task Level ${level} - ${level}`,
      color,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">WBS Color Settings</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-blue-600">Enable WBS Colors</span>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  enabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-2 gap-6 flex-1 overflow-hidden min-h-[420px]">
          {/* Left: Palette selector */}
          <div className="flex flex-col overflow-y-auto pr-2 space-y-4">
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowPalettes(!showPalettes)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                {showPalettes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showPalettes ? 'Hide Palettes' : 'Show Palettes'}</span>
              </button>
            </div>

            {showPalettes && (
              <div className="grid grid-cols-2 gap-3">
                {palettes.map(pal => {
                  const isSelected = pal.id === selectedPaletteId;
                  return (
                    <div
                      key={pal.id}
                      onClick={() => setSelectedPaletteId(pal.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800 text-center mb-2.5">
                        {pal.name}
                      </div>
                      <div className="space-y-1">
                        {pal.colors.slice(0, 4).map((c, idx) => (
                          <div
                            key={idx}
                            className="h-6 rounded-md flex items-center px-2 text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: c }}
                          >
                            <span>{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Live Preview Tree (15 levels depth) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-slate-50/30">
            <div className="p-2.5 text-center text-xs font-bold text-blue-600 border-b border-slate-200 bg-white">
              Task name
            </div>
            <div className="p-3 overflow-y-auto flex-1 space-y-1 font-mono text-xs">
              {previewRows.map(row => (
                <div
                  key={row.level}
                  className="flex items-center gap-1.5 p-1 rounded-sm text-white font-medium text-[11px] shadow-2xs transition-transform"
                  style={{
                    backgroundColor: enabled ? row.color : '#64748b',
                    marginLeft: `${(row.level - 1) * 12}px`,
                  }}
                >
                  <div className="w-3.5 h-3.5 bg-white/20 rounded-xs flex items-center justify-center shrink-0">
                    <Minus className="w-2.5 h-2.5 text-white" />
                  </div>
                  <Folder className="w-3.5 h-3.5 text-white/90 shrink-0 fill-current" />
                  <span className="truncate">{row.name}</span>
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
            Reset to Default
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
