import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Activity,
  WBSNode,
  ColumnDefinition,
  DurationUnit,
  BarSetting,
} from '../../types/p6';
import {
  ChevronRight,
  ChevronDown,
  Folder,
} from 'lucide-react';
import { WBSRollup } from '../../lib/wbs/rollup';

export interface DisplayRow {
  type: 'wbs' | 'activity';
  id: string;
  wbsId?: string;
  wbsNode?: WBSNode;
  activity?: Activity;
  rollup?: WBSRollup;
  level: number;
  color?: string;
}

interface ActivityTableProps {
  rows: DisplayRow[];
  columns: ColumnDefinition[];
  selectedActivityId: string | null;
  durationUnit: DurationUnit;
  barSettings: BarSetting[];
  onSelectActivity: (activityId: string) => void;
  onToggleWBSCollapse: (wbsId: string) => void;
  onUpdateColumnWidth?: (columnId: string, newWidth: number) => void;
  collapsedWbsIds: Set<string>;
  wbsColorsEnabled: boolean;
  tableScrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  rows,
  columns,
  selectedActivityId,
  durationUnit,
  barSettings,
  onSelectActivity,
  onToggleWBSCollapse,
  onUpdateColumnWidth,
  collapsedWbsIds,
  wbsColorsEnabled,
  tableScrollRef,
  onScroll,
}) => {
  const visibleColumns = columns.filter(c => c.visible);
  const prevSelectedIdRef = useRef<string | null>(null);

  // Column Drag Resizing
  const [resizingColId, setResizingColId] = useState<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);

  const handleStartResize = (e: React.MouseEvent, colId: string, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColId(colId);
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = currentWidth || (colId === 'name' ? 280 : 110);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - resizeStartXRef.current;
      const newW = Math.max(55, Math.min(600, resizeStartWidthRef.current + delta));
      if (onUpdateColumnWidth) {
        onUpdateColumnWidth(colId, newW);
      }
    };

    const onMouseUp = () => {
      setResizingColId(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Auto-scroll table ONLY when user explicitly selects a different activity
  useEffect(() => {
    if (!selectedActivityId || !tableScrollRef.current) return;
    if (prevSelectedIdRef.current === selectedActivityId) return;
    prevSelectedIdRef.current = selectedActivityId;

    const rowIdx = rows.findIndex(r => r.type === 'activity' && r.activity?.activityId === selectedActivityId);
    if (rowIdx !== -1) {
      const targetY = rowIdx * 36;
      const containerHeight = tableScrollRef.current.clientHeight;
      tableScrollRef.current.scrollTo({
        top: Math.max(0, targetY - containerHeight / 2 + 18),
        behavior: 'smooth',
      });
    }
  }, [selectedActivityId, rows]);

  const formatDuration = (hours: number): string => {
    let val = hours;
    if (durationUnit === 'd') val = hours / 8;
    else if (durationUnit === 'w') val = hours / 48;
    else if (durationUnit === 'm') val = hours / 208;
    return `${val.toFixed(1)} ${durationUnit}`;
  };

  const renderActivityStatusIcon = (act: Activity) => {
    if (act.activityType.includes('Milestone')) {
      return (
        <div
          className="w-3 h-3 rotate-45 shrink-0 shadow-2xs"
          style={{
            backgroundColor: act.isCritical
              ? '#ef4444'
              : act.status === 'Completed'
              ? '#0284c7'
              : '#84cc16',
          }}
        />
      );
    }
    return (
      <div
        className="w-3.5 h-2.5 rounded-2xs shrink-0"
        style={{
          backgroundColor: act.isCritical
            ? '#ef4444'
            : act.status === 'Completed'
            ? '#0284c7'
            : '#84cc16',
        }}
      />
    );
  };

  const renderCellContent = (row: DisplayRow, col: ColumnDefinition) => {
    // --- WBS SUMMARY ROW WITH ROLLUPS ---
    if (row.type === 'wbs') {
      const r = row.rollup;
      switch (col.id) {
        case 'name': {
          const isCollapsed = collapsedWbsIds.has(row.wbsNode!.wbsId);
          return (
            <div
              className="flex items-center gap-2 font-bold text-xs"
              style={{ paddingLeft: `${(row.level - 1) * 16}px` }}
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  onToggleWBSCollapse(row.wbsNode!.wbsId);
                }}
                className="w-4 h-4 rounded hover:bg-slate-300/50 flex items-center justify-center text-slate-700 cursor-pointer shrink-0"
                title={isCollapsed ? 'Expand WBS' : 'Collapse WBS'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </button>
              <div
                className="w-4 h-3.5 rounded-2xs shrink-0 flex items-center justify-center text-[9px] text-white shadow-2xs"
                style={{
                  backgroundColor: wbsColorsEnabled && row.color ? row.color : '#475569',
                }}
              >
                <Folder className="w-3 h-3 fill-current" />
              </div>
              <span className="truncate text-slate-900 font-bold">{row.wbsNode?.name}</span>
              {r && r.activityCount > 0 && (
                <span className="text-[10px] text-slate-500 font-normal ml-1 shrink-0">
                  ({r.activityCount})
                </span>
              )}
            </div>
          );
        }
        case 'activityId':
          return (
            <span className="font-mono text-xs font-bold text-slate-700">
              {row.wbsNode?.shortCode || '-'}
            </span>
          );
        case 'status':
          return r ? (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                r.status === 'Completed'
                  ? 'bg-sky-100 text-sky-800'
                  : r.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {r.status}
            </span>
          ) : null;
        case 'activityType':
          return <span className="text-slate-500 text-[11px] font-semibold">WBS Summary</span>;
        case 'plannedDuration':
          return r ? (
            <span className="font-mono text-xs font-bold text-slate-900">
              {formatDuration(r.plannedDuration)}
            </span>
          ) : null;
        case 'remainingDuration':
          return r ? (
            <span className="font-mono text-xs font-bold text-slate-900">
              {formatDuration(r.remainingDuration)}
            </span>
          ) : null;
        case 'actualDuration':
          return r ? (
            <span className="font-mono text-xs font-bold text-slate-900">
              {formatDuration(r.actualDuration)}
            </span>
          ) : null;
        case 'atCompletionDuration':
          return r ? (
            <span className="font-mono text-xs font-bold text-slate-900">
              {formatDuration(r.atCompletionDuration)}
            </span>
          ) : null;
        case 'earlyStart':
          return (
            <span className="font-mono text-xs font-bold text-slate-900">
              {r?.startDate || '-'}
            </span>
          );
        case 'earlyFinish':
          return (
            <span className="font-mono text-xs font-bold text-slate-900">
              {r?.finishDate || '-'}
            </span>
          );
        case 'lateStart':
          return (
            <span className="font-mono text-xs font-bold text-slate-800">
              {r?.lateStartDate || '-'}
            </span>
          );
        case 'lateFinish':
          return (
            <span className="font-mono text-xs font-bold text-slate-800">
              {r?.lateFinishDate || '-'}
            </span>
          );
        case 'actualStart':
          return (
            <span className="font-mono text-xs font-bold text-slate-800">
              {r?.actualStartDate || '-'}
            </span>
          );
        case 'actualFinish':
          return (
            <span className="font-mono text-xs font-bold text-slate-800">
              {r?.actualFinishDate || '-'}
            </span>
          );
        case 'totalFloat':
          return r ? (
            <span
              className={`font-mono text-xs font-bold ${
                r.totalFloat <= 0 ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              {formatDuration(r.totalFloat)}
            </span>
          ) : null;
        case 'activityPctComplete':
          return r ? (
            <div className="flex items-center gap-1.5 w-full">
              <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${r.activityPctComplete}%` }}
                />
              </div>
              <span className="font-mono text-[10px] font-bold text-slate-700 w-7 text-right">
                {r.activityPctComplete}%
              </span>
            </div>
          ) : null;
        default:
          return <span className="text-slate-400 text-xs">-</span>;
      }
    }

    // --- ACTIVITY ROW ---
    const act = row.activity!;
    switch (col.id) {
      case 'name':
        return (
          <div
            className="flex items-center gap-2.5 text-xs font-medium"
            style={{ paddingLeft: `${row.level * 16 + 8}px` }}
          >
            {renderActivityStatusIcon(act)}
            <span className="truncate text-slate-800">{act.name}</span>
          </div>
        );
      case 'activityId':
        return <span className="font-mono text-xs font-bold text-blue-600">{act.activityId}</span>;
      case 'status':
        return (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              act.status === 'Completed'
                ? 'bg-sky-100 text-sky-800'
                : act.status === 'In Progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {act.status}
          </span>
        );
      case 'activityType':
        return <span className="text-slate-600 text-xs truncate">{act.activityType}</span>;
      case 'plannedDuration':
        return <span className="font-mono text-xs text-slate-800">{formatDuration(act.duration.plannedDuration)}</span>;
      case 'remainingDuration':
        return <span className="font-mono text-xs text-slate-800">{formatDuration(act.duration.remainingDuration)}</span>;
      case 'actualDuration':
        return <span className="font-mono text-xs text-slate-800">{formatDuration(act.duration.actualDuration)}</span>;
      case 'atCompletionDuration':
        return <span className="font-mono text-xs text-slate-800">{formatDuration(act.duration.atCompletionDuration)}</span>;
      case 'earlyStart':
        return <span className="font-mono text-xs text-slate-800">{act.dates.earlyStart || '-'}</span>;
      case 'earlyFinish':
        return <span className="font-mono text-xs text-slate-800">{act.dates.earlyFinish || '-'}</span>;
      case 'lateStart':
        return <span className="font-mono text-xs text-slate-800">{act.dates.lateStart || '-'}</span>;
      case 'lateFinish':
        return <span className="font-mono text-xs text-slate-800">{act.dates.lateFinish || '-'}</span>;
      case 'actualStart':
        return <span className="font-mono text-xs text-slate-800">{act.dates.actualStart || '-'}</span>;
      case 'actualFinish':
        return <span className="font-mono text-xs text-slate-800">{act.dates.actualFinish || '-'}</span>;
      case 'totalFloat':
        return (
          <span
            className={`font-mono text-xs font-semibold ${
              act.duration.totalFloat <= 0 ? 'text-red-600 font-bold' : 'text-slate-800'
            }`}
          >
            {formatDuration(act.duration.totalFloat)}
          </span>
        );
      case 'freeSlack':
        return <span className="font-mono text-xs text-slate-800">{formatDuration(act.duration.freeSlack || 0)}</span>;
      case 'activityPctComplete':
        return (
          <div className="flex items-center gap-1.5 w-full">
            <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${act.progress.activityPctComplete}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-slate-600 w-7 text-right">
              {act.progress.activityPctComplete}%
            </span>
          </div>
        );
      case 'assignedResource':
        return <span className="text-slate-700 text-xs truncate">{act.assignedResource || '-'}</span>;
      case 'calendarId':
        return <span className="font-mono text-xs text-slate-600">{act.calendarId}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden select-none">
      {/* Table Header with Draggable Column Resizers */}
      <div className="flex bg-slate-50 border-b border-slate-200 h-10 items-center text-xs font-bold text-blue-600 shrink-0 overflow-x-hidden">
        {visibleColumns.map((col) => {
          const colWidth = col.width || (col.id === 'name' ? 280 : 110);

          return (
            <div
              key={col.id}
              style={{ width: `${colWidth}px`, minWidth: `${colWidth}px`, maxWidth: `${colWidth}px` }}
              className="relative px-3 py-2 border-r border-slate-200 truncate flex items-center justify-between shrink-0 group select-none"
            >
              <span className="truncate">{col.label}</span>
              {col.id === 'earlyStart' && <span className="text-blue-500 text-[10px]">▼</span>}

              {/* Draggable Resizer Edge */}
              <div
                onMouseDown={(e) => handleStartResize(e, col.id, colWidth)}
                className={`absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize z-30 transition-colors ${
                  resizingColId === col.id ? 'bg-blue-600' : 'hover:bg-blue-400/80'
                }`}
                title="Drag to resize column width"
              />
            </div>
          );
        })}
      </div>

      {/* Table Scrollable Rows */}
      <div
        ref={tableScrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto overflow-x-auto divide-y divide-slate-100"
      >
        {rows.map(row => {
          const isSelected = row.type === 'activity' && row.activity?.activityId === selectedActivityId;
          const isWBS = row.type === 'wbs';

          return (
            <div
              key={row.id}
              onClick={() => {
                if (isWBS && row.wbsNode) {
                  onToggleWBSCollapse(row.wbsNode.wbsId);
                } else if (row.type === 'activity' && row.activity) {
                  onSelectActivity(row.activity.activityId);
                }
              }}
              style={{
                height: '36px',
                backgroundColor: isWBS
                  ? (wbsColorsEnabled && row.color ? `${row.color}18` : '#f1f5f9')
                  : undefined,
                borderLeft: isWBS && wbsColorsEnabled && row.color
                  ? `4px solid ${row.color}`
                  : undefined,
              }}
              className={`flex items-center transition-all cursor-pointer text-xs ${
                isWBS
                  ? 'hover:brightness-95 font-bold border-b border-slate-200/80 shadow-2xs'
                  : isSelected
                  ? 'bg-blue-100/80 hover:bg-blue-100 text-blue-950 font-bold border-l-4 border-l-blue-600 ring-1 ring-blue-300 shadow-2xs'
                  : 'hover:bg-slate-50/80 text-slate-800'
              }`}
            >
              {visibleColumns.map((col) => {
                const colWidth = col.width || (col.id === 'name' ? 280 : 110);

                return (
                  <div
                    key={col.id}
                    style={{ width: `${colWidth}px`, minWidth: `${colWidth}px`, maxWidth: `${colWidth}px` }}
                    className="px-3 h-full flex items-center border-r border-slate-100/80 truncate shrink-0"
                  >
                    {renderCellContent(row, col)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
