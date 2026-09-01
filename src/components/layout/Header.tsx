import React from 'react';
import {
  GanttChartSquare,
  Sparkles,
  HelpCircle,
  Moon,
  Sun,
  User,
  ExternalLink,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  activeModule: 'viewer' | 'drafter';
  onSelectModule: (mod: 'viewer' | 'drafter') => void;
  projectName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onSelectModule,
  projectName,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 h-14 px-6 flex items-center justify-between shadow-2xs z-30 shrink-0 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              ScheduleReader
            </span>
            <span className="font-normal text-xs text-blue-600 ml-1 italic font-serif">
              Online
            </span>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onSelectModule('viewer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeModule === 'viewer'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <GanttChartSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Schedule Viewer</span>
          </button>

          <button
            onClick={() => onSelectModule('drafter')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeModule === 'drafter'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Schedule Drafter</span>
          </button>
        </div>
      </div>

      {/* Right User & Utility Menu */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-700">
          <span className="text-slate-400">Active Schedule:</span>
          <span className="font-bold text-slate-900">{projectName || 'Project Training'}</span>
        </div>

        <button className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium">
          <span>Help</span>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <button
          title="Dark / Light Mode"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Moon className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
