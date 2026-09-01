import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Plus,
  Trash2,
  GitFork,
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Upload,
  Edit3,
  Folder,
} from 'lucide-react';
import {
  ScheduleFragment,
  WBSNode,
  Activity,
  Relationship,
  Project,
  RelationshipType,
  ActivityType,
} from '../../types/p6';
import { serializeFragmentToXER } from '../../lib/xer/serializer';
import { CascadingWBSSelector } from './CascadingWBSSelector';
import { generateScheduleFromPrompt } from '../../lib/ai/scheduleGenerator';
import { analyzeActivityIdPattern, formatActivityId } from '../../lib/p6/activityIdPattern';

interface AIDraftingAssistantProps {
  currentProject: Project;
  currentWbsNodes: WBSNode[];
  currentActivities: Activity[];
  currentRelationships: Relationship[];
  onMergeIntoViewer: (mergedWbs: WBSNode[], mergedActs: Activity[], mergedRels: Relationship[]) => void;
}

export const AIDraftingAssistant: React.FC<AIDraftingAssistantProps> = ({
  currentProject,
  currentWbsNodes,
  currentActivities,
  currentRelationships,
  onMergeIntoViewer,
}) => {
  const [prompt, setPrompt] = useState('I am working on a Conveyor junction house of a steel plant.');
  const [projectType, setProjectType] = useState('Steel Plant / Industrial');
  const [targetDurationWeeks, setTargetDurationWeeks] = useState(12);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fragment, setFragment] = useState<ScheduleFragment | null>(null);
  const [isAppendModalOpen, setIsAppendModalOpen] = useState(false);

  // Target WBS selection from existing schedule
  const [selectedTargetWbsId, setSelectedTargetWbsId] = useState<string>(
    currentWbsNodes[0]?.wbsId || ''
  );
  const [mergeMode, setMergeMode] = useState<'asChildWbs' | 'directActivities'>('asChildWbs');

  // Automatically sync target WBS when new file or project is loaded
  useEffect(() => {
    if (currentWbsNodes.length > 0) {
      const exists = currentWbsNodes.some(w => w.wbsId === selectedTargetWbsId);
      if (!exists) {
        setSelectedTargetWbsId(currentWbsNodes[0].wbsId);
      }
    }
  }, [currentWbsNodes, selectedTargetWbsId]);

  // Add Activity Modal state
  const [isNewActModalOpen, setIsNewActModalOpen] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActWbsId, setNewActWbsId] = useState('');
  const [newActDays, setNewActDays] = useState(5);
  const [newActResource, setNewActResource] = useState('');

  const domainPresets = [
    {
      title: 'Conveyor Junction House',
      prompt: 'I am working on a Conveyor junction house of a steel plant.',
      type: 'Steel Plant / Industrial',
      weeks: 14,
    },
    {
      title: 'Blast Furnace Foundation',
      prompt: 'Civil foundation and heavy equipment pedestal for Blast Furnace area.',
      type: 'Heavy Civil',
      weeks: 18,
    },
    {
      title: 'Substation Electrical & Switchgear',
      prompt: '33kV Substation civil building, transformer erection, and switchgear cabling.',
      type: 'Electrical & Substation',
      weeks: 10,
    },
    {
      title: 'Water Treatment Plant Piping',
      prompt: 'Industrial raw water treatment plant underground piping, pumps, and valves.',
      type: 'Mechanical Piping',
      weeks: 12,
    },
  ];

  // Selected WBS object
  const selectedWbsNode = useMemo(() => {
    return currentWbsNodes.find(w => w.wbsId === selectedTargetWbsId) || currentWbsNodes[0] || null;
  }, [currentWbsNodes, selectedTargetWbsId]);

  // Automatically detect Activity ID pattern (Prefix, padding digits, step increment) from loaded schedule
  const detectedIdPattern = useMemo(() => {
    return analyzeActivityIdPattern(currentActivities, selectedTargetWbsId);
  }, [currentActivities, selectedTargetWbsId]);

  const handleGenerateDraft = (customPromptText?: string) => {
    const textToUse = customPromptText || prompt;
    if (!textToUse.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const generated = generateScheduleFromPrompt({
        prompt: textToUse,
        projectType,
        targetDurationWeeks,
        parentWbsId: selectedTargetWbsId || null,
        parentWbsCode: selectedWbsNode?.shortCode || 'WBS',
        parentWbsName: selectedWbsNode?.name || 'Target Scope',
        parentLevel: selectedWbsNode?.level || 1,
        projectId: currentProject.id,
        activityIdPattern: detectedIdPattern,
      });

      setFragment(generated);
      setIsGenerating(false);
    }, 400);
  };

  // Direct Inline Edit Activity Handler
  const handleUpdateActivity = (actId: string, updates: Partial<Activity>) => {
    if (!fragment) return;
    setFragment({
      ...fragment,
      activities: fragment.activities.map(a => (a.activityId === actId ? { ...a, ...updates } : a)),
    });
  };

  // Delete Activity Handler
  const handleDeleteActivity = (actId: string) => {
    if (!fragment) return;
    setFragment({
      ...fragment,
      activities: fragment.activities.filter(a => a.activityId !== actId),
      relationships: fragment.relationships.filter(
        r => r.predActivityId !== actId && r.succActivityId !== actId
      ),
    });
  };

  // Add New Activity Handler
  const handleAddNewActivity = () => {
    if (!newActName.trim() || !fragment) return;
    const nextIdNum = fragment.activities.length > 0
      ? Math.max(...fragment.activities.map(a => parseInt(a.activityId.replace(/\D/g, '')) || 2000)) + 10
      : 2010;
    const actId = `A${nextIdNum}`;
    const wbsId = newActWbsId || fragment.wbsNodes[0]?.wbsId || 'FRAG-WBS-1';

    const newAct: Activity = {
      activityId: actId,
      name: newActName,
      wbsId,
      projectId: currentProject.id,
      activityType: 'Task Dependent',
      status: 'Not Started',
      isCritical: false,
      isLongestPath: false,
      calendarId: 'CAL-1',
      assignedResource: newActResource || 'Crew',
      dates: { earlyStart: '2025-02-01', earlyFinish: '2025-02-07', lateStart: '2025-02-01', lateFinish: '2025-02-07' },
      duration: { plannedDuration: newActDays * 8, remainingDuration: newActDays * 8, actualDuration: 0, atCompletionDuration: newActDays * 8, totalFloat: 0, freeSlack: 0 },
      progress: { activityPctComplete: 0, pctCompleteType: 'Duration' },
    };

    setFragment({
      ...fragment,
      activities: [...fragment.activities, newAct],
    });
    setNewActName('');
    setNewActResource('');
    setIsNewActModalOpen(false);
  };

  // Export Excel / CSV Template for Scope Input
  const handleExportCSVTemplate = () => {
    const csvContent = [
      'WBS Code,WBS Name,Activity Name,Duration (Days),Predecessor ID,Resource Tag',
      'CJH.1,Civil & Foundation Works,Excavation for pit,6,,Civil Crew',
      'CJH.1,Civil & Foundation Works,Reinforced concrete casting,12,A2010,Civil Crew',
      'CJH.2,Structural Steel,Anchor bolt alignment,3,A2020,Survey Rigging',
      'CJH.2,Structural Steel,Tower structure erection,15,A2030,Crane Rigging',
      'CJH.3,Mechanical Chutes,Chute installation,11,A2040,Millwrights',
      'CJH.3,Mechanical Chutes,Drive motor positioning,8,A2060,Electrical Crew',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Schedule_Scope_Template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Printable PDF / Document Template Guide
  const handleExportPDFTemplate = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Primavera P6 Scope Drafting Guide</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #1e293b; }
            h1 { color: #1d4ed8; font-size: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>AI Schedule Drafting Scope Template</h1>
          <p>Please enter work breakdown details, planned duration, and dependencies:</p>
          <table>
            <thead>
              <tr><th>WBS Name</th><th>Activity Description</th><th>Planned Duration (Days)</th><th>Predecessors</th><th>Crew / Resource</th></tr>
            </thead>
            <tbody>
              <tr><td>Civil Works</td><td>Excavation and trenching</td><td>5</td><td>-</td><td>Excavation Crew</td></tr>
              <tr><td>Civil Works</td><td>Rebar tying and formwork</td><td>8</td><td>A2010</td><td>Steel Fixing Team</td></tr>
              <tr><td>Structural</td><td>Main column erection</td><td>12</td><td>A2020</td><td>Crane & Rigging</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // File Upload Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (text) {
        setPrompt(prev => `${prev}\n\n[Uploaded Document Scope]:\n${text.slice(0, 500)}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportFragment = () => {
    if (!fragment) return;
    const xerContent = serializeFragmentToXER(fragment, 'AI Schedule Fragment');
    const blob = new Blob([xerContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fragment_${Date.now()}.xer`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Merge into existing loaded schedule
  const handleMergeIntoSchedule = () => {
    if (!fragment) return;

    const maxExistingId = Math.max(
      ...currentActivities.map(a => parseInt(a.activityId.replace(/\D/g, '')) || 1000)
    );

    const idMap = new Map<string, string>();

    // Map drafted WBS IDs to new unique IDs
    const wbsIdMap = new Map<string, string>();
    let wbsOffset = currentWbsNodes.length + 10;

    const remappedWbsNodes: WBSNode[] = fragment.wbsNodes.map(w => {
      wbsOffset++;
      const newWbsId = `WBS-AI-${wbsOffset}`;
      wbsIdMap.set(w.wbsId, newWbsId);

      return {
        ...w,
        wbsId: newWbsId,
        parentWbsId: selectedTargetWbsId || null,
        projectId: currentProject.id,
        level: (selectedWbsNode?.level || 1) + 1,
      };
    });

    const renumberedActs: Activity[] = fragment.activities.map((a, seqIdx) => {
      const newId = formatActivityId(detectedIdPattern, seqIdx);
      idMap.set(a.activityId, newId);

      const targetWbsId =
        mergeMode === 'directActivities'
          ? (selectedTargetWbsId || currentWbsNodes[0]?.wbsId)
          : (wbsIdMap.get(a.wbsId) || a.wbsId);

      return {
        ...a,
        activityId: newId,
        wbsId: targetWbsId,
        projectId: currentProject.id,
      };
    });

    const renumberedRels: Relationship[] = fragment.relationships.map((r, idx) => ({
      ...r,
      id: `REL-AI-${Date.now()}-${idx + 1}`,
      predActivityId: idMap.get(r.predActivityId) || r.predActivityId,
      succActivityId: idMap.get(r.succActivityId) || r.succActivityId,
    }));

    const mergedWbs =
      mergeMode === 'directActivities'
        ? [...currentWbsNodes]
        : [...currentWbsNodes, ...remappedWbsNodes];

    const mergedActs = [...currentActivities, ...renumberedActs];
    const mergedRels = [...currentRelationships, ...renumberedRels];

    onMergeIntoViewer(mergedWbs, mergedActs, mergedRels);
    setIsAppendModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-6 space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h1 className="text-xl font-bold tracking-tight">AI Schedule Drafting Assistant</h1>
          </div>
          <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
            Draft Primavera P6 Work Breakdown Structures, activities, and logic relationships from plain-language project scopes.
          </p>
        </div>

        {/* Template Downloads & Upload */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-xs">
          <button
            onClick={handleExportCSVTemplate}
            title="Download Scope Template in Excel / CSV format"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 hover:bg-slate-50 rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel/CSV Template</span>
          </button>

          <button
            onClick={handleExportPDFTemplate}
            title="Print or Export Scope Specification Template"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 hover:bg-slate-50 rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>PDF Template</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold cursor-pointer shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
            <input type="file" accept=".csv,.xlsx,.xls,.txt,.doc" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Scope Input Card & Presets */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Scope Description / Query
            </span>
            <span className="text-[11px] text-slate-400">Type or upload scope file above</span>
          </div>

          <textarea
            rows={3}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the construction package or scope (e.g. 'I am working on a Conveyor junction house of a steel plant')..."
            className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
          />

          {/* Group-wise Cascading WBS Level Selector (L1 -> L2 -> L3 -> L4) */}
          <CascadingWBSSelector
            wbsNodes={currentWbsNodes}
            activities={currentActivities}
            selectedWbsId={selectedTargetWbsId}
            onSelectWbsId={id => setSelectedTargetWbsId(id)}
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 font-semibold">Industry Domain</label>
                <select
                  value={projectType}
                  onChange={e => setProjectType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                >
                  <option value="Steel Plant / Industrial">Steel Plant / Industrial</option>
                  <option value="Heavy Civil">Heavy Civil</option>
                  <option value="Electrical & Substation">Electrical & Substation</option>
                  <option value="Mechanical Piping">Mechanical Piping</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-semibold">Target Duration (Weeks)</label>
                <input
                  type="number"
                  value={targetDurationWeeks}
                  onChange={e => setTargetDurationWeeks(parseInt(e.target.value) || 12)}
                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleGenerateDraft()}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Generating Structured Draft...' : 'Generate Schedule Draft'}</span>
            </button>
          </div>
        </div>

        {/* Domain Presets Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Domain Templates
          </span>
          <div className="space-y-2">
            {domainPresets.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPrompt(preset.prompt);
                  setProjectType(preset.type);
                  setTargetDurationWeeks(preset.weeks);
                  handleGenerateDraft(preset.prompt);
                }}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{preset.title}</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {preset.weeks}w
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {preset.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Draft Review & Output Card with Fully Editable Activity Rows */}
      {fragment && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Generated Schedule Fragment</h3>
                <p className="text-xs text-slate-500">
                  Target WBS Branch: <span className="font-semibold text-blue-700">{selectedWbsNode?.shortCode} — {selectedWbsNode?.name}</span> ({fragment.activities.length} activities, {fragment.relationships.length} logic links) • <span className="text-blue-600 font-semibold">Editable inline below</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewActModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Activity</span>
              </button>

              <button
                onClick={handleExportFragment}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export XER</span>
              </button>

              <button
                onClick={() => setIsAppendModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Merge into Loaded Schedule</span>
              </button>
            </div>
          </div>

          {/* Activities Table with Direct Inline Editing */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-blue-600 font-bold">
                  <th className="py-2.5 px-3 w-20">ID</th>
                  <th className="py-2.5 px-3">Activity Name (Click to edit)</th>
                  <th className="py-2.5 px-3 w-36">WBS Branch</th>
                  <th className="py-2.5 px-3 w-36 text-center">Type</th>
                  <th className="py-2.5 px-3 w-28 text-center">Planned (Days)</th>
                  <th className="py-2.5 px-3 w-36">Resource Tag</th>
                  <th className="py-2.5 px-3 w-16 text-center">Critical</th>
                  <th className="py-2.5 px-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fragment.activities.map(act => {
                  const actWbs = fragment.wbsNodes.find(w => w.wbsId === act.wbsId);
                  return (
                    <tr key={act.activityId} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Activity ID */}
                      <td className="py-2 px-3 font-mono font-bold text-blue-600">{act.activityId}</td>

                      {/* Editable Activity Name */}
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={act.name}
                          onChange={e => handleUpdateActivity(act.activityId, { name: e.target.value })}
                          className="w-full text-xs font-semibold text-slate-900 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded-lg px-2 py-1 transition-all focus:outline-none"
                        />
                      </td>

                      {/* WBS Branch selector */}
                      <td className="py-2 px-3">
                        <select
                          value={act.wbsId}
                          onChange={e => handleUpdateActivity(act.activityId, { wbsId: e.target.value })}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 rounded px-2 py-1 text-[11px] font-semibold border border-transparent focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                          {fragment.wbsNodes.map(w => (
                            <option key={w.wbsId} value={w.wbsId}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Editable Activity Type */}
                      <td className="py-1.5 px-3 text-center">
                        <select
                          value={act.activityType}
                          onChange={e =>
                            handleUpdateActivity(act.activityId, {
                              activityType: e.target.value as ActivityType,
                            })
                          }
                          className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Task Dependent">Task Dependent</option>
                          <option value="Start Milestone">Start Milestone</option>
                          <option value="Finish Milestone">Finish Milestone</option>
                          <option value="Level of Effort">Level of Effort</option>
                        </select>
                      </td>

                      {/* Editable Planned Duration in Days */}
                      <td className="py-1.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus-within:border-blue-500 focus-within:bg-white">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={act.duration.plannedDuration / 8}
                            onChange={e => {
                              const days = parseFloat(e.target.value) || 0;
                              handleUpdateActivity(act.activityId, {
                                duration: {
                                  ...act.duration,
                                  plannedDuration: days * 8,
                                  remainingDuration: days * 8,
                                  atCompletionDuration: days * 8,
                                },
                              });
                            }}
                            className="w-12 text-right font-mono text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                          />
                          <span className="text-[11px] text-slate-400 font-semibold">d</span>
                        </div>
                      </td>

                      {/* Editable Assigned Resource Tag */}
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          placeholder="e.g. Civil Crew"
                          value={act.assignedResource || ''}
                          onChange={e =>
                            handleUpdateActivity(act.activityId, { assignedResource: e.target.value })
                          }
                          className="w-full text-xs text-slate-700 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded-lg px-2 py-1 transition-all focus:outline-none"
                        />
                      </td>

                      {/* Critical Toggle */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateActivity(act.activityId, { isCritical: !act.isCritical })
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            act.isCritical
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {act.isCritical ? 'Critical' : 'Normal'}
                        </button>
                      </td>

                      {/* Delete Activity Button */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act.activityId)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {isNewActModalOpen && fragment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Add New Activity</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cable pull and terminations"
                  value={newActName}
                  onChange={e => setNewActName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">WBS Branch</label>
                  <select
                    value={newActWbsId}
                    onChange={e => setNewActWbsId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    {fragment.wbsNodes.map(w => (
                      <option key={w.wbsId} value={w.wbsId}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Duration (Days)</label>
                  <input
                    type="number"
                    value={newActDays}
                    onChange={e => setNewActDays(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsNewActModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewActivity}
                disabled={!newActName.trim()}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full shadow-xs cursor-pointer"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Append to Loaded WBS Modal */}
      {isAppendModalOpen && fragment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="p-6 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Merge Fragment into Loaded Schedule</h2>
              <p className="text-xs text-slate-500 mt-1">
                Confirm target WBS branch in <strong>{currentProject.name}</strong>.
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Merge Mode Radio */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">Merge Hierarchy Method:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setMergeMode('asChildWbs')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      mergeMode === 'asChildWbs'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Folder className="w-4 h-4 text-blue-600" />
                      <span>Attach Child WBS Nodes</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Creates drafted WBS categories as child branches under the chosen target WBS.
                    </p>
                  </div>

                  <div
                    onClick={() => setMergeMode('directActivities')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      mergeMode === 'directActivities'
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Direct Activities Only</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Appends all drafted activities directly inside the selected WBS node.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cascading Target WBS Selector in Modal */}
              <CascadingWBSSelector
                wbsNodes={currentWbsNodes}
                activities={currentActivities}
                selectedWbsId={selectedTargetWbsId}
                onSelectWbsId={id => setSelectedTargetWbsId(id)}
              />

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 leading-relaxed">
                Will merge <strong>{fragment.activities.length} activities</strong> and <strong>{fragment.relationships.length} logic links</strong> under <strong>{selectedWbsNode?.name || 'Selected WBS'}</strong> without ID collisions.
              </div>
            </div>

            <div className="p-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
              <button
                onClick={() => setIsAppendModalOpen(false)}
                className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleMergeIntoSchedule}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Confirm & Open in Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
