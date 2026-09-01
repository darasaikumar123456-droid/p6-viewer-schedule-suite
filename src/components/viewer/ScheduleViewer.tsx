import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  Filter,
  Columns,
  Layers,
  Palette,
  Info,
  BookOpen,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Download,
  Upload,
  Clock,
  Printer,
  ListFilter,
  Eye,
  CheckCircle2,
  GitFork,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import {
  Project,
  WBSNode,
  Activity,
  Relationship,
  Calendar,
  ColumnDefinition,
  BarSetting,
  DurationUnit,
  TimeScaleUnit,
  FilterState,
  GroupRule,
  BaselineRevision,
  RelationshipType,
} from '../../types/p6';
import {
  defaultColumns,
  allAvailableColumns,
  defaultBarSettings,
  wbsPalettes,
} from '../../data/sampleSchedule';
import { ActivityTable, DisplayRow } from './ActivityTable';
import { GanttChart, TimescaleWidths, defaultTimescaleWidths } from './GanttChart';
import { ActivityDetailDrawer } from './ActivityDetailDrawer';
import { ColumnsModal } from './modals/ColumnsModal';
import { BarSettingsModal } from './modals/BarSettingsModal';
import { WBSColorModal } from './modals/WBSColorModal';
import { DurationFormatModal } from './modals/DurationFormatModal';
import { FiltersModal } from './modals/FiltersModal';
import { GroupingModal } from './modals/GroupingModal';
import { BaselinesModal } from './modals/BaselinesModal';
import { ProjectInfoModal } from './modals/ProjectInfoModal';
import { LegendModal } from './modals/LegendModal';
import { runCPM, CPMResult } from '../../lib/cpm/calculator';
import { serializeToXER } from '../../lib/xer/serializer';
import { parseXER } from '../../lib/xer/parser';
import { computeWBSRollups, WBSRollup } from '../../lib/wbs/rollup';

interface ScheduleViewerProps {
  initialProject: Project;
  initialWbsNodes: WBSNode[];
  initialActivities: Activity[];
  initialRelationships: Relationship[];
  initialCalendars: Calendar[];
  onScheduleChange?: (
    project: Project,
    wbsNodes: WBSNode[],
    activities: Activity[],
    relationships: Relationship[],
    calendars: Calendar[]
  ) => void;
}

export const ScheduleViewer: React.FC<ScheduleViewerProps> = ({
  initialProject,
  initialWbsNodes,
  initialActivities,
  initialRelationships,
  initialCalendars,
  onScheduleChange,
}) => {
  // Core Schedule State
  const [project, setProject] = useState<Project>(initialProject);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>(initialWbsNodes);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);
  const [calendars, setCalendars] = useState<Calendar[]>(initialCalendars);

  // Viewer Settings State
  const [timeScale, setTimeScale] = useState<TimeScaleUnit>('month');
  const [timescaleWidths, setTimescaleWidths] = useState<TimescaleWidths>(defaultTimescaleWidths);
  const [columns, setColumns] = useState<ColumnDefinition[]>(defaultColumns);
  const [barSettings, setBarSettings] = useState<BarSetting[]>(defaultBarSettings);
  const [wbsColorsEnabled, setWbsColorsEnabled] = useState(true);
  const [activePaletteId, setActivePaletteId] = useState('default');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('d');
  const [showRelationships, setShowRelationships] = useState(true);
  const [filterState, setFilterState] = useState<FilterState>({
    statuses: ['Not Started', 'In Progress', 'Completed'],
    selectedWbsIds: [],
    activityCodes: {},
    hideIfEmpty: true,
  });
  const [groupRules, setGroupRules] = useState<GroupRule[]>([
    { id: 'GR-1', groupBy: 'WBS', indent: true, toLevel: 20 },
  ]);

  // Baseline Revisions State
  const [baselines, setBaselines] = useState<BaselineRevision[]>([
    {
      projectId: project.id,
      revisionNumber: 0,
      name: 'Initial Baseline (Rev 0)',
      uploadedAt: '2024-04-01 09:00:00',
      sourceFile: 'Project_Baseline.xer',
      activitiesSnapshot: initialActivities.reduce((acc, a) => {
        acc[a.activityId] = {
          startDate: a.dates.earlyStart,
          finishDate: a.dates.earlyFinish,
          durationDays: a.duration.plannedDuration / 8,
        };
        return acc;
      }, {} as any),
    },
  ]);
  const [selectedBaselineNumber, setSelectedBaselineNumber] = useState<number | null>(null);

  // Interaction State
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(initialActivities[0]?.activityId || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [collapsedWbsIds, setCollapsedWbsIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [splitWidth, setSplitWidth] = useState(520);
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);
  const [cpmSummary, setCpmSummary] = useState<CPMResult | null>(null);

  // Modals Open State
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isBarSettingsModalOpen, setIsBarSettingsModalOpen] = useState(false);
  const [isWBSColorModalOpen, setIsWBSColorModalOpen] = useState(false);
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isGroupingModalOpen, setIsGroupingModalOpen] = useState(false);
  const [isBaselinesModalOpen, setIsBaselinesModalOpen] = useState(false);
  const [isProjectInfoModalOpen, setIsProjectInfoModalOpen] = useState(false);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);

  // Synchronized scroll refs
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<string | null>(null);

  const handleTableScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingRef.current && isScrollingRef.current !== 'table') return;
    isScrollingRef.current = 'table';
    if (ganttScrollRef.current) {
      ganttScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    setTimeout(() => {
      isScrollingRef.current = null;
    }, 50);
  }, []);

  const handleGanttScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingRef.current && isScrollingRef.current !== 'gantt') return;
    isScrollingRef.current = 'gantt';
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    setTimeout(() => {
      isScrollingRef.current = null;
    }, 50);
  }, []);

  const activePalette = wbsPalettes.find(p => p.id === activePaletteId) || wbsPalettes[0];

  const isFilterActive = useMemo(() => {
    return (
      Boolean(searchQuery) ||
      Boolean(filterState.startDate) ||
      Boolean(filterState.endDate) ||
      filterState.isCriticalOnly ||
      filterState.selectedWbsIds.length > 0 ||
      (filterState.statuses && filterState.statuses.length < 3)
    );
  }, [searchQuery, filterState]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setFilterState({
      startDate: '',
      endDate: '',
      statuses: ['Not Started', 'In Progress', 'Completed'],
      isCriticalOnly: false,
      selectedWbsIds: [],
      activityCodes: {},
      hideIfEmpty: true,
    });
  };

  const handleUpdateColumnWidth = useCallback((colId: string, newWidth: number) => {
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, width: newWidth } : c));
  }, []);

  // Compute full WBS hierarchical rollups
  const wbsRollups = useMemo(() => {
    return computeWBSRollups(wbsNodes, activities);
  }, [wbsNodes, activities]);

  // Helper to compute rollups for arbitrary grouped activity lists
  const computeGroupRollup = (acts: Activity[]): WBSRollup => {
    if (acts.length === 0) {
      return {
        startDate: '',
        finishDate: '',
        lateStartDate: '',
        lateFinishDate: '',
        actualStartDate: null,
        actualFinishDate: null,
        totalFloat: 0,
        plannedDuration: 0,
        remainingDuration: 0,
        actualDuration: 0,
        atCompletionDuration: 0,
        activityPctComplete: 0,
        status: 'Not Started',
        activityCount: 0,
      };
    }
    let minStart = '9999-99-99';
    let maxFinish = '0000-00-00';
    let minFloat = 999999;
    let totalPlannedHrs = 0;
    let totalActHrs = 0;
    let totalRemHrs = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    acts.forEach(a => {
      const start = a.dates.actualStart || a.dates.earlyStart;
      const finish = a.dates.actualFinish || a.dates.earlyFinish;
      if (start && start < minStart) minStart = start;
      if (finish && finish > maxFinish) maxFinish = finish;
      if (a.duration.totalFloat < minFloat) minFloat = a.duration.totalFloat;
      totalPlannedHrs += a.duration.plannedDuration || 0;
      totalActHrs += a.duration.actualDuration || 0;
      totalRemHrs += a.duration.remainingDuration || 0;
      if (a.status === 'Completed') completedCount++;
      else if (a.status === 'In Progress') inProgressCount++;
    });

    const totalAtComp = totalActHrs + totalRemHrs;
    const pct = totalAtComp > 0 ? Math.round((totalActHrs / totalAtComp) * 100) : (completedCount === acts.length ? 100 : 0);

    return {
      startDate: minStart !== '9999-99-99' ? minStart : '',
      finishDate: maxFinish !== '0000-00-00' ? maxFinish : '',
      lateStartDate: '',
      lateFinishDate: '',
      actualStartDate: null,
      actualFinishDate: null,
      totalFloat: minFloat !== 999999 ? minFloat : 0,
      plannedDuration: totalPlannedHrs,
      remainingDuration: totalRemHrs,
      actualDuration: totalActHrs,
      atCompletionDuration: totalAtComp,
      activityPctComplete: pct,
      status: completedCount === acts.length ? 'Completed' : (inProgressCount > 0 || completedCount > 0 ? 'In Progress' : 'Not Started'),
      activityCount: acts.length,
    };
  };

  // Compute hierarchical display rows safely based on active GroupRule
  const rows = useMemo(() => {
    const result: DisplayRow[] = [];

    const filteredActs = activities.filter(a => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesId = a.activityId.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      if (filterState.startDate) {
        const actStart = a.dates.actualStart || a.dates.earlyStart;
        if (actStart < filterState.startDate) return false;
      }
      if (filterState.endDate) {
        const actEnd = a.dates.actualFinish || a.dates.earlyFinish;
        if (actEnd > filterState.endDate) return false;
      }
      if (filterState.statuses && filterState.statuses.length > 0 && !filterState.statuses.includes(a.status)) {
        return false;
      }
      if (filterState.isCriticalOnly && !a.isCritical) return false;
      if (filterState.selectedWbsIds.length > 0 && !filterState.selectedWbsIds.includes(a.wbsId)) return false;
      return true;
    });

    const primaryRule = groupRules[0] || { groupBy: 'WBS', indent: true, toLevel: 20 };

    // --- CASE A: GROUP BY STATUS ---
    if (primaryRule.groupBy === 'Status') {
      const statusGroups = ['In Progress', 'Not Started', 'Completed'] as const;
      statusGroups.forEach((st, idx) => {
        const groupActs = filteredActs.filter(a => a.status === st);
        const isCollapsed = collapsedWbsIds.has(`status-${st}`);
        const rollup = computeGroupRollup(groupActs);
        const color = activePalette.colors[idx % activePalette.colors.length];

        result.push({
          type: 'wbs',
          id: `row-group-status-${st}`,
          wbsId: `status-${st}`,
          wbsNode: {
            wbsId: `status-${st}`,
            parentWbsId: null,
            shortCode: st.toUpperCase(),
            name: `Status: ${st}`,
            level: 1,
            projectId: project.id,
            expanded: !isCollapsed,
          },
          rollup,
          level: 1,
          color,
        });

        if (!isCollapsed) {
          groupActs.forEach(act => {
            result.push({
              type: 'activity',
              id: `row-act-${act.activityId}`,
              activity: act,
              level: 2,
              wbsId: `status-${st}`,
            });
          });
        }
      });
      return result;
    }

    // --- CASE B: GROUP BY ACTIVITY TYPE ---
    if (primaryRule.groupBy === 'Activity Type') {
      const typeGroups = ['Task Dependent', 'Start Milestone', 'Finish Milestone', 'Level of Effort', 'WBS Summary'] as const;
      typeGroups.forEach((typeStr, idx) => {
        const groupActs = filteredActs.filter(a => a.activityType === typeStr);
        if (groupActs.length === 0) return;
        const isCollapsed = collapsedWbsIds.has(`type-${typeStr}`);
        const rollup = computeGroupRollup(groupActs);
        const color = activePalette.colors[idx % activePalette.colors.length];

        result.push({
          type: 'wbs',
          id: `row-group-type-${typeStr}`,
          wbsId: `type-${typeStr}`,
          wbsNode: {
            wbsId: `type-${typeStr}`,
            parentWbsId: null,
            shortCode: typeStr.toUpperCase(),
            name: `Type: ${typeStr}`,
            level: 1,
            projectId: project.id,
            expanded: !isCollapsed,
          },
          rollup,
          level: 1,
          color,
        });

        if (!isCollapsed) {
          groupActs.forEach(act => {
            result.push({
              type: 'activity',
              id: `row-act-${act.activityId}`,
              activity: act,
              level: 2,
              wbsId: `type-${typeStr}`,
            });
          });
        }
      });
      return result;
    }

    // --- CASE C: GROUP BY RESOURCE ---
    if (primaryRule.groupBy === 'Resource') {
      const resourceMap = new Map<string, Activity[]>();
      filteredActs.forEach(a => {
        const rName = a.assignedResource || 'Unassigned';
        if (!resourceMap.has(rName)) resourceMap.set(rName, []);
        resourceMap.get(rName)!.push(a);
      });

      let idx = 0;
      resourceMap.forEach((rActs, rName) => {
        const isCollapsed = collapsedWbsIds.has(`rsrc-${rName}`);
        const rollup = computeGroupRollup(rActs);
        const color = activePalette.colors[idx % activePalette.colors.length];
        idx++;

        result.push({
          type: 'wbs',
          id: `row-group-rsrc-${rName}`,
          wbsId: `rsrc-${rName}`,
          wbsNode: {
            wbsId: `rsrc-${rName}`,
            parentWbsId: null,
            shortCode: 'RSRC',
            name: `Resource: ${rName}`,
            level: 1,
            projectId: project.id,
            expanded: !isCollapsed,
          },
          rollup,
          level: 1,
          color,
        });

        if (!isCollapsed) {
          rActs.forEach(act => {
            result.push({
              type: 'activity',
              id: `row-act-${act.activityId}`,
              activity: act,
              level: 2,
              wbsId: `rsrc-${rName}`,
            });
          });
        }
      });
      return result;
    }

    // --- CASE D: DEFAULT GROUP BY WBS (Hierarchical WBS tree) ---
    const maxLevel = primaryRule.toLevel || 20;
    const wbsIdSet = new Set(wbsNodes.map(w => w.wbsId));
    let rootNodes = wbsNodes.filter(w => !w.parentWbsId || !wbsIdSet.has(w.parentWbsId));

    if (rootNodes.length === 0 && wbsNodes.length > 0) {
      rootNodes = [wbsNodes[0]];
    }

    const processWbsNode = (node: WBSNode, depth: number) => {
      const isCollapsed = collapsedWbsIds.has(node.wbsId);
      const color = activePalette.colors[(depth - 1) % activePalette.colors.length];
      const rollup = wbsRollups.get(node.wbsId);

      result.push({
        type: 'wbs',
        id: `row-wbs-${node.wbsId}`,
        wbsId: node.wbsId,
        wbsNode: node,
        rollup,
        level: depth,
        color,
      });

      if (!isCollapsed) {
        const directActs = filteredActs.filter(a => a.wbsId === node.wbsId);
        directActs.forEach(act => {
          result.push({
            type: 'activity',
            id: `row-act-${act.activityId}`,
            activity: act,
            level: depth + 1,
            wbsId: node.wbsId,
          });
        });

        if (depth < maxLevel) {
          const childNodes = wbsNodes.filter(w => w.parentWbsId === node.wbsId);
          childNodes.forEach(child => processWbsNode(child, depth + 1));
        }
      }
    };

    rootNodes.forEach(root => processWbsNode(root, 1));

    // True orphans only
    const trueOrphanActs = filteredActs.filter(a => !wbsIdSet.has(a.wbsId));
    if (trueOrphanActs.length > 0 && result.length > 0) {
      trueOrphanActs.forEach(act => {
        result.push({
          type: 'activity',
          id: `row-act-${act.activityId}`,
          activity: act,
          level: 2,
          wbsId: act.wbsId,
        });
      });
    }

    return result;
  }, [wbsNodes, activities, collapsedWbsIds, searchQuery, filterState, activePalette, wbsRollups, groupRules]);

  // Selected Activity Object
  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) return activities[0] || null;
    return activities.find(a => a.activityId === selectedActivityId) || activities[0] || null;
  }, [activities, selectedActivityId]);

  // Handle activity selection with automatic parent WBS expansion
  const handleSelectActivity = useCallback((actId: string) => {
    setSelectedActivityId(actId);
    setIsDrawerOpen(true);

    const targetAct = activities.find(a => a.activityId === actId);
    if (targetAct && targetAct.wbsId) {
      setCollapsedWbsIds(prev => {
        const next = new Set(prev);
        let currWbsId: string | null = targetAct.wbsId;
        const visited = new Set<string>();
        while (currWbsId && !visited.has(currWbsId)) {
          visited.add(currWbsId);
          next.delete(currWbsId);
          const parentNode = wbsNodes.find(w => w.wbsId === currWbsId);
          currWbsId = parentNode?.parentWbsId || null;
        }
        return next;
      });
    }
  }, [activities, wbsNodes]);

  // Toggle single WBS collapse
  const handleToggleWBSCollapse = (wbsId: string) => {
    setCollapsedWbsIds(prev => {
      const next = new Set(prev);
      if (next.has(wbsId)) next.delete(wbsId);
      else next.add(wbsId);
      return next;
    });
  };

  // Toggle All WBS collapse
  const handleToggleAllCollapse = () => {
    if (isAllCollapsed) {
      setCollapsedWbsIds(new Set());
      setIsAllCollapsed(false);
    } else {
      const allIds = new Set(wbsNodes.map(w => w.wbsId));
      setCollapsedWbsIds(allIds);
      setIsAllCollapsed(true);
    }
  };

  // Run in-app CPM forward and backward pass
  const handleRunCPM = () => {
    const result = runCPM(activities, relationships, calendars, project);
    setActivities(result.activities);
    setProject(prev => ({ ...prev, finishDate: result.projectFinishDate }));
    setCpmSummary(result);
  };

  // Activity Edit Handler
  const handleUpdateActivity = (updated: Activity) => {
    setActivities(prev => {
      const updatedList = prev.map(a => (a.activityId === updated.activityId ? updated : a));
      return updatedList;
    });
  };

  // Relationship Handlers
  const handleAddRelationship = (
    predId: string,
    succId: string,
    type: RelationshipType,
    lagHours: number
  ) => {
    const newRel: Relationship = {
      id: `REL-${Date.now()}`,
      predActivityId: predId,
      succActivityId: succId,
      type,
      lagHours,
      isDriving: true,
    };
    setRelationships(prev => [...prev, newRel]);
  };

  const handleUpdateRelationship = (relId: string, updates: Partial<Relationship>) => {
    setRelationships(prev => prev.map(r => (r.id === relId ? { ...r, ...updates } : r)));
  };

  const handleDeleteRelationship = (relId: string) => {
    setRelationships(prev => prev.filter(r => r.id !== relId));
  };

  // Export XER file
  const handleExportXER = () => {
    const xerText = serializeToXER(project, calendars, wbsNodes, activities, relationships);
    const blob = new Blob([xerText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.shortId || 'SCHEDULE'}_Export.xer`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import XER file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (text) {
        try {
          const parsed = parseXER(text);
          setProject(parsed.project);
          setCalendars(parsed.calendars);
          setWbsNodes(parsed.wbsNodes);
          setActivities(parsed.activities);
          setRelationships(parsed.relationships);
          setCollapsedWbsIds(new Set());
          setSelectedActivityId(parsed.activities[0]?.activityId || null);
          setIsDrawerOpen(true);
          setCpmSummary(null);
          setIsAllCollapsed(false);

          onScheduleChange?.(
            parsed.project,
            parsed.wbsNodes,
            parsed.activities,
            parsed.relationships,
            parsed.calendars
          );
        } catch (err) {
          alert('Failed to parse XER file. Please verify the format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden select-none">
      {/* Top Header & Timescale Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-2xs shrink-0">
        {/* Left: View Tabs (Day, Week, Month, Quarter, Year) + Zoom Level Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['day', 'week', 'month', 'quarter', 'year'] as const).map(scale => (
              <button
                key={scale}
                onClick={() => setTimeScale(scale)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  timeScale === scale
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {scale}
              </button>
            ))}
          </div>

          {/* Timescale Column Width Zoom In / Zoom Out */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                const cur = timescaleWidths[timeScale];
                const step = timeScale === 'day' ? 4 : timeScale === 'week' ? 8 : timeScale === 'month' ? 12 : 20;
                setTimescaleWidths(prev => ({
                  ...prev,
                  [timeScale]: Math.max(14, cur - step),
                }));
              }}
              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title={`Zoom Out ${timeScale} column width`}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-700 px-1 w-14 text-center">
              {timescaleWidths[timeScale]}px
            </span>
            <button
              onClick={() => {
                const cur = timescaleWidths[timeScale];
                const step = timeScale === 'day' ? 4 : timeScale === 'week' ? 8 : timeScale === 'month' ? 12 : 20;
                setTimescaleWidths(prev => ({
                  ...prev,
                  [timeScale]: Math.min(800, cur + step),
                }));
              }}
              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title={`Zoom In ${timeScale} column width`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Search, Filter Active Badge & Collapse Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Gantt Chart"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-full focus:outline-none transition-all w-48"
            />
          </div>

          {isFilterActive && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-full text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-red-600" />
              <span>Clear Filters</span>
            </button>
          )}

          <button
            onClick={handleToggleAllCollapse}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 transition-colors cursor-pointer"
          >
            <span>{isAllCollapsed ? 'Expand All' : 'Collapse All'}</span>
            {isAllCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* Right: Actions (Toggle Relationships, Compute CPM, Export, Import) */}
        <div className="flex items-center gap-2">
          {/* Show / Hide Relationships Toggle Button */}
          <button
            onClick={() => setShowRelationships(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              showRelationships
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Toggle Gantt dependency relationship link lines and arrowheads"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>{showRelationships ? 'Hide Logic Lines' : 'Show Logic Lines'}</span>
          </button>

          {/* Run CPM Analysis Button */}
          <button
            onClick={handleRunCPM}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            title="Recalculate CPM Schedule logic forward & backward pass with actuals and revised forecast"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run CPM Analysis</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 cursor-pointer transition-colors">
            <Upload className="w-3 h-3" />
            <span>Import XER</span>
            <input type="file" accept=".xer,.xml" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportXER}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full shadow-xs transition-colors cursor-pointer"
            title="Export complete P6 XER file"
          >
            <Download className="w-3 h-3" />
            <span>Export XER</span>
          </button>
        </div>
      </div>

      {/* CPM Revised Forecast Banner if Analysis Ran */}
      {cpmSummary && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between text-xs text-emerald-900 shadow-2xs shrink-0 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CPM Recalculation Complete:</span>
            </div>
            <div>
              <span className="text-slate-600">Forecast Project Finish: </span>
              <span className="font-mono font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                {cpmSummary.projectFinishDate}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Schedule Variance: </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded ${
                  cpmSummary.varianceDays > 0
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : cpmSummary.varianceDays < 0
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {cpmSummary.varianceDays > 0 ? `+${cpmSummary.varianceDays}d (Delay)` : cpmSummary.varianceDays < 0 ? `${cpmSummary.varianceDays}d (Ahead)` : 'On Schedule'}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Critical Activities: </span>
              <span className="font-bold text-red-600">{cpmSummary.criticalActivityIds.length}</span>
            </div>
          </div>

          <button
            onClick={() => setCpmSummary(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 hover:bg-emerald-100 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace Area (Left Icon Rail + Split Resizable Body) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Icon Rail */}
        <div className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-2 shrink-0 shadow-2xs">
          <button
            onClick={() => setIsGroupingModalOpen(true)}
            title="Grouping Rules"
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
          >
            <ListFilter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFiltersModalOpen(true)}
            title="Filters (General, WBS, Codes)"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isFilterActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsColumnsModalOpen(true)}
            title="Columns Configuration"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Columns className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsBarSettingsModalOpen(true)}
            title="Bar Settings"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDurationModalOpen(true)}
            title="Duration Format (h, d, w, m)"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsBaselinesModalOpen(true)}
            title="Baselines Comparison"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsWBSColorModalOpen(true)}
            title="WBS Color Settings"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Palette className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsProjectInfoModalOpen(true)}
            title="Projects Information"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLegendModalOpen(true)}
            title="Legend Schemes"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          <button
            onClick={() => window.print()}
            title="Print View"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Split Body: Left Table & Right Gantt */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Left Resizable Table */}
            <div style={{ width: `${splitWidth}px` }} className="shrink-0 h-full flex flex-col">
              <ActivityTable
                rows={rows}
                columns={columns}
                selectedActivityId={selectedActivityId}
                durationUnit={durationUnit}
                barSettings={barSettings}
                onSelectActivity={handleSelectActivity}
                onToggleWBSCollapse={handleToggleWBSCollapse}
                onUpdateColumnWidth={handleUpdateColumnWidth}
                collapsedWbsIds={collapsedWbsIds}
                wbsColorsEnabled={wbsColorsEnabled}
                tableScrollRef={tableScrollRef}
                onScroll={handleTableScroll}
              />
            </div>

            {/* Split Resizer Divider */}
            <div
              className="w-1 bg-slate-200 hover:bg-blue-500 cursor-col-resize shrink-0 transition-colors"
              onMouseDown={e => {
                const startX = e.clientX;
                const startW = splitWidth;
                const onMouseMove = (moveEvent: MouseEvent) => {
                  const newW = Math.max(280, Math.min(1000, startW + (moveEvent.clientX - startX)));
                  setSplitWidth(newW);
                };
                const onMouseUp = () => {
                  window.removeEventListener('mousemove', onMouseMove);
                  window.removeEventListener('mouseup', onMouseUp);
                };
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
              }}
            />

            {/* Right Gantt Chart */}
            <div className="flex-1 h-full overflow-hidden">
              <GanttChart
                rows={rows}
                relationships={relationships}
                allActivities={activities}
                timeScale={timeScale}
                timescaleWidths={timescaleWidths}
                onUpdateTimescaleWidth={(u, w) => setTimescaleWidths(prev => ({ ...prev, [u]: w }))}
                barSettings={barSettings}
                selectedActivityId={selectedActivityId}
                selectedBaseline={
                  selectedBaselineNumber !== null
                    ? baselines.find(b => b.revisionNumber === selectedBaselineNumber) || null
                    : null
                }
                showRelationships={showRelationships}
                ganttScrollRef={ganttScrollRef}
                onScroll={handleGanttScroll}
                onSelectActivity={handleSelectActivity}
              />
            </div>
          </div>

          {/* Bottom Activity Detail Drawer */}
          {selectedActivity && isDrawerOpen && (
            <ActivityDetailDrawer
              activity={selectedActivity}
              allActivities={activities}
              relationships={relationships}
              onClose={() => setIsDrawerOpen(false)}
              onUpdateActivity={handleUpdateActivity}
              onAddRelationship={handleAddRelationship}
              onUpdateRelationship={handleUpdateRelationship}
              onDeleteRelationship={handleDeleteRelationship}
              onSelectActivity={handleSelectActivity}
            />
          )}

          {/* Collapsed Drawer Reopen Bar if Drawer is Hidden */}
          {!isDrawerOpen && selectedActivity && (
            <div
              onClick={() => setIsDrawerOpen(true)}
              className="bg-slate-800 text-white px-4 py-1.5 flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors shrink-0"
            >
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 px-2 py-0.5 rounded font-mono text-[11px]">
                  {selectedActivity.activityId}
                </span>
                <span className="truncate">{selectedActivity.name}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Show Activity Details</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals Suite */}
      <ColumnsModal
        isOpen={isColumnsModalOpen}
        onClose={() => setIsColumnsModalOpen(false)}
        columns={columns}
        allAvailableColumns={allAvailableColumns}
        onSave={cols => setColumns(cols)}
      />

      <BarSettingsModal
        isOpen={isBarSettingsModalOpen}
        onClose={() => setIsBarSettingsModalOpen(false)}
        barSettings={barSettings}
        projectName={project.name}
        onSave={bars => setBarSettings(bars)}
        onOpenWBSColorModal={() => setIsWBSColorModalOpen(true)}
      />

      <WBSColorModal
        isOpen={isWBSColorModalOpen}
        onClose={() => setIsWBSColorModalOpen(false)}
        palettes={wbsPalettes}
        activePaletteId={activePaletteId}
        wbsColorsEnabled={wbsColorsEnabled}
        onSave={(palId, enabled) => {
          setActivePaletteId(palId);
          setWbsColorsEnabled(enabled);
        }}
      />

      <DurationFormatModal
        isOpen={isDurationModalOpen}
        onClose={() => setIsDurationModalOpen(false)}
        unit={durationUnit}
        onSave={u => setDurationUnit(u)}
      />

      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filterState={filterState}
        wbsNodes={wbsNodes}
        onSave={filters => setFilterState(filters)}
      />

      <GroupingModal
        isOpen={isGroupingModalOpen}
        onClose={() => setIsGroupingModalOpen(false)}
        groupRules={groupRules}
        onSave={rules => setGroupRules(rules)}
      />

      <BaselinesModal
        isOpen={isBaselinesModalOpen}
        onClose={() => setIsBaselinesModalOpen(false)}
        projectName={project.name}
        baselines={baselines}
        selectedBaselineNumber={selectedBaselineNumber}
        onSelectBaseline={rev => setSelectedBaselineNumber(rev)}
      />

      <ProjectInfoModal
        isOpen={isProjectInfoModalOpen}
        onClose={() => setIsProjectInfoModalOpen(false)}
        projects={[project]}
      />

      <LegendModal
        isOpen={isLegendModalOpen}
        onClose={() => setIsLegendModalOpen(false)}
      />
    </div>
  );
};
