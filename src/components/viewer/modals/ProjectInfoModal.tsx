import React from 'react';
import { X } from 'lucide-react';
import { Project } from '../../../types/p6';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({
  isOpen,
  onClose,
  projects,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Projects Information
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Body */}
        <div className="p-6 flex-1 overflow-x-auto">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-blue-600 font-semibold">
                  <th className="py-3 px-4">Id</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Finish Date</th>
                  <th className="py-3 px-4">Data Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{proj.shortId}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{proj.name}</td>
                    <td className="py-3 px-4 text-slate-600">{proj.startDate}</td>
                    <td className="py-3 px-4 text-slate-600">{proj.finishDate}</td>
                    <td className="py-3 px-4 text-slate-600">{proj.dataDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
