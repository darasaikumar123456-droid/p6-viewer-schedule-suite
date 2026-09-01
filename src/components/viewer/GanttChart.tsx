import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import {
  Activity,
  Relationship,
  TimeScaleUnit,
  BarSetting,
  BaselineRevision,
} from '../../types/p6';
import { DisplayRow } from './ActivityTable';
import { Sliders, Maximize, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export interface TimescaleWidths {
  day: number;
  week: number;
  month: number;
  quarter: number;
  year: number;
}

export const defaultTimescaleWidths: TimescaleWidths = {
  day: 36,
  week: 70,
  month: 120,
  quarter: 180,
  year: 260,
};

interface GanttChartProps {
  rows: DisplayRow[];
  relationships: Relationship[];
  allActivities: Activity[];
  timeScale: TimeScaleUnit;
  timescaleWidths?: TimescaleWidths;
  onUpdateTimescaleWidth?: (unit: TimeScaleUnit, newWidth: number) => void;
  barSettings: BarSetting[];
  selectedActivityId: string | null;
  selectedBaseline: BaselineRevision | null;
  showRelationships: boolean;
  ganttScrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onSelectActivity: (actId: string) => void;
}

interface MajorTick {
  label: string;
  x: number;
  width: number;
}

interface MinorTick {
  label: string;
  subLabel?: string;
  x: number;
  width: number;
  startDate: Date;
  endDate: Date;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  rows,
  relationships,
  allActivities,
  timeScale,
  timescaleWidths = defaultTimescaleWidths,
  onUpdateTimescaleWidth,
  barSettings,
  selectedActivityId,
  selectedBaseline,
  showRelationships,
  ganttScrollRef,
  onScroll,
  onSelectActivity,
}) => {
  const prevSelectedIdRef = useRef<string | null>(null);
  const [isResizingTimescale, setIsResizingTimescale] = useState(false);
  const [showTimescaleMenu, setShowTimescaleMenu] = useState(false);

  // Fast O(1) activity lookup map
  const activityMap = useMemo(() => {
    const map = new Map<string, Activity>();
    allActivities.forEach(a => map.set(a.activityId, a));
    return map;
  }, [allActivities]);

  // Determine overall timeline min and max dates aligned to calendar boundaries
  const { minDate, maxDate } = useMemo(() => {
    let min = '2099-12-31';
    let max = '1970-01-01';

    allActivities.forEach(a => {
      const s = a.dates.actualStart || a.dates.earlyStart;
      const f = a.dates.actualFinish || a.dates.earlyFinish;
      if (s && s < min) min = s;
      if (f && f > max) max = f;
    });

    if (min > max || min === '2099-12-31') {
      min = '2024-01-01';
      max = '2028-12-31';
    }

    const minD = new Date(min);
    // Align start to the 1st of month/year with buffer
    const startAligned = new Date(minD.getFullYear(), Math.max(0, minD.getMonth() - 1), 1);
    const maxD = new Date(max);
    const endAligned = new Date(maxD.getFullYear(), maxD.getMonth() + 3, 0);

    return { minDate: startAligned, maxDate: endAligned };
  }, [allActivities]);

  // Current active unit column width
  const currentUnitWidth = timescaleWidths[timeScale] || defaultTimescaleWidths[timeScale];

  // Generate 2-tier major and minor calendar headers with exact widths
  const { majorTicks, minorTicks, totalTimelineWidth, dateToXMap } = useMemo(() => {
    const majors: MajorTick[] = [];
    const minors: MinorTick[] = [];

    const startYear = minDate.getFullYear();
    const endYear = maxDate.getFullYear();

    let currentX = 0;

    if (timeScale === 'day') {
      // Day mode: Major = Month Year, Minor = Days
      const curr = new Date(minDate);
      let currentMonth = -1;
      let monthStartX = 0;
      let monthName = '';

      while (curr <= maxDate) {
        const dMonth = curr.getMonth();
        const dYear = curr.getFullYear();

        if (dMonth !== currentMonth) {
          if (currentMonth !== -1) {
            majors.push({
              label: monthName,
              x: monthStartX,
              width: currentX - monthStartX,
            });
          }
          currentMonth = dMonth;
          monthStartX = currentX;
          monthName = curr.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        minors.push({
          label: curr.toLocaleDateString('en-US', { weekday: 'narrow' }),
          subLabel: `${curr.getDate()}`,
          x: currentX,
          width: currentUnitWidth,
          startDate: new Date(curr),
          endDate: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate(), 23, 59, 59),
        });

        currentX += currentUnitWidth;
        curr.setDate(curr.getDate() + 1);
      }

      if (currentMonth !== -1) {
        majors.push({
          label: monthName,
          x: monthStartX,
          width: currentX - monthStartX,
        });
      }
    } else if (timeScale === 'week') {
      // Week mode: Major = Month Year, Minor = Week start dates (e.g. 7 days / week)
      const curr = new Date(minDate);
      let currentMonth = -1;
      let monthStartX = 0;
      let monthName = '';

      while (curr <= maxDate) {
        const dMonth = curr.getMonth();
        if (dMonth !== currentMonth) {
          if (currentMonth !== -1) {
            majors.push({
              label: monthName,
              x: monthStartX,
              width: currentX - monthStartX,
            });
          }
          currentMonth = dMonth;
          monthStartX = currentX;
          monthName = curr.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }

        const weekEnd = new Date(curr);
        weekEnd.setDate(weekEnd.getDate() + 6);

        minors.push({
          label: curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          x: currentX,
          width: currentUnitWidth,
          startDate: new Date(curr),
          endDate: weekEnd,
        });

        currentX += currentUnitWidth;
        curr.setDate(curr.getDate() + 7);
      }

      if (currentMonth !== -1) {
        majors.push({
          label: monthName,
          x: monthStartX,
          width: currentX - monthStartX,
        });
      }
    } else if (timeScale === 'month') {
      // Month mode: Major = Year, Minor = Months
      for (let y = startYear; y <= endYear; y++) {
        const yearStartX = currentX;

        for (let m = 0; m < 12; m++) {
          const monthDate = new Date(y, m, 1);
          if (monthDate < minDate && y === startYear && m < minDate.getMonth()) continue;
          if (monthDate > maxDate) break;

          const monthDays = new Date(y, m + 1, 0).getDate();
          const monthEnd = new Date(y, m, monthDays, 23, 59, 59);

          minors.push({
            label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
            subLabel: `'${String(y).slice(-2)}`,
            x: currentX,
            width: currentUnitWidth,
            startDate: monthDate,
            endDate: monthEnd,
          });

          currentX += currentUnitWidth;
        }

        majors.push({
          label: `${y}`,
          x: yearStartX,
          width: currentX - yearStartX,
        });
      }
    } else if (timeScale === 'quarter') {
      // Quarter mode: Major = Year, Minor = Quarters (Q1, Q2, Q3, Q4)
      for (let y = startYear; y <= endYear; y++) {
        const yearStartX = currentX;

        for (let q = 1; q <= 4; q++) {
          const qStartMonth = (q - 1) * 3;
          const qStartDate = new Date(y, qStartMonth, 1);
          if (qStartDate > maxDate) break;
          const qEndDate = new Date(y, qStartMonth + 3, 0, 23, 59, 59);

          minors.push({
            label: `Q${q}`,
            subLabel: `${y}`,
            x: currentX,
            width: currentUnitWidth,
            startDate: qStartDate,
            endDate: qEndDate,
          });

          currentX += currentUnitWidth;
        }

        majors.push({
          label: `${y}`,
          x: yearStartX,
          width: currentX - yearStartX,
        });
      }
    } else {
      // Year mode: Major = 5-Year Decade Band, Minor = Years
      let decadeStartX = currentX;
      let currentDecade = Math.floor(startYear / 5) * 5;

      for (let y = startYear; y <= endYear + 1; y++) {
        const dGroup = Math.floor(y / 5) * 5;
        if (dGroup !== currentDecade) {
          majors.push({
            label: `${currentDecade} — ${currentDecade + 4}`,
            x: decadeStartX,
            width: currentX - decadeStartX,
          });
          currentDecade = dGroup;
          decadeStartX = currentX;
        }

        const yStartDate = new Date(y, 0, 1);
        const yEndDate = new Date(y, 11, 31, 23, 59, 59);

        minors.push({
          label: `${y}`,
          x: currentX,
          width: currentUnitWidth,
          startDate: yStartDate,
          endDate: yEndDate,
        });

        currentX += currentUnitWidth;
      }

      if (currentX > decadeStartX) {
        majors.push({
          label: `${currentDecade} — ${currentDecade + 4}`,
          x: decadeStartX,
          width: currentX - decadeStartX,
        });
      }
    }

    return {
      majorTicks: majors,
      minorTicks: minors,
      totalTimelineWidth: Math.max(1400, currentX),
      dateToXMap: minors,
    };
  }, [minDate, maxDate, timeScale, currentUnitWidth]);

  // Precise date-to-pixel coordinate function based on minor intervals
  const getXFromDate = useCallback((dateStr?: string | null): number => {
    if (!dateStr) return 0;
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return 0;

    if (dateToXMap.length === 0) return 0;

    // Check if before start or after end
    const firstTick = dateToXMap[0];
    const lastTick = dateToXMap[dateToXMap.length - 1];

    if (targetDate <= firstTick.startDate) return firstTick.x;
    if (targetDate >= lastTick.endDate) return lastTick.x + lastTick.width;

    // Binary search or linear scan for the matching interval tick
    for (let i = 0; i < dateToXMap.length; i++) {
      const tick = dateToXMap[i];
      if (targetDate >= tick.startDate && targetDate <= tick.endDate) {
        const tickDuration = tick.endDate.getTime() - tick.startDate.getTime();
        const progress = tickDuration > 0 ? (targetDate.getTime() - tick.startDate.getTime()) / tickDuration : 0;
        return tick.x + progress * tick.width;
      }
    }

    // Fallback linear interpolation
    const totalSpan = lastTick.endDate.getTime() - firstTick.startDate.getTime();
    const frac = totalSpan > 0 ? (targetDate.getTime() - firstTick.startDate.getTime()) / totalSpan : 0;
    return frac * totalTimelineWidth;
  }, [dateToXMap, totalTimelineWidth]);

  // Drag-to-resize Timescale column width directly on header ticks
  const handleStartHeaderResize = (e: React.MouseEvent, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingTimescale(true);

    const startX = e.clientX;
    const startW = currentWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let minW = 16;
      let maxW = 500;

      if (timeScale === 'day') { minW = 14; maxW = 120; }
      else if (timeScale === 'week') { minW = 28; maxW = 250; }
      else if (timeScale === 'month') { minW = 40; maxW = 400; }
      else if (timeScale === 'quarter') { minW = 60; maxW = 600; }
      else if (timeScale === 'year') { minW = 100; maxW = 800; }

      const newW = Math.max(minW, Math.min(maxW, Math.round(startW + deltaX)));
      if (onUpdateTimescaleWidth) {
        onUpdateTimescaleWidth(timeScale, newW);
      }
    };

    const onMouseUp = () => {
      setIsResizingTimescale(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Fit entire project to screen
  const handleFitToScreen = () => {
    if (!ganttScrollRef.current || minorTicks.length === 0) return;
    const visibleWidth = ganttScrollRef.current.clientWidth - 40;
    const targetUnitWidth = Math.max(16, Math.floor(visibleWidth / minorTicks.length));
    if (onUpdateTimescaleWidth) {
      onUpdateTimescaleWidth(timeScale, targetUnitWidth);
    }
    if (ganttScrollRef.current) {
      ganttScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Wheel zoom (Ctrl + Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const step = timeScale === 'day' ? 4 : timeScale === 'week' ? 8 : timeScale === 'month' ? 12 : 20;
      const delta = e.deltaY < 0 ? step : -step;
      const newW = Math.max(16, Math.min(800, currentUnitWidth + delta));
      if (onUpdateTimescaleWidth) {
        onUpdateTimescaleWidth(timeScale, newW);
      }
    }
  };

  // Auto-scroll timeline ONLY when selecting a different activity
  useEffect(() => {
    if (!selectedActivityId || !ganttScrollRef.current) return;
    if (prevSelectedIdRef.current === selectedActivityId) return;
    prevSelectedIdRef.current = selectedActivityId;

    const selectedAct = activityMap.get(selectedActivityId);
    if (!selectedAct) return;

    const actDate = selectedAct.dates.actualStart || selectedAct.dates.earlyStart;
    if (actDate) {
      const actX = getXFromDate(actDate);
      const containerWidth = ganttScrollRef.current.clientWidth;
      const targetScrollLeft = Math.max(0, actX - containerWidth / 3);
      ganttScrollRef.current.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  }, [selectedActivityId, getXFromDate, activityMap]);

  // Fast Map of activityId to row index
  const activityRowMap = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, idx) => {
      if (row.type === 'activity' && row.activity) {
        map.set(row.activity.activityId, idx);
      } else if (row.type === 'wbs' && row.wbsNode) {
        map.set(`wbs-${row.wbsNode.wbsId}`, idx);
      }
    });
    return map;
  }, [rows]);

  const isBarVisible = (id: string) => {
    const setting = barSettings.find(b => b.id === id);
    return setting ? setting.visible : true;
  };

  // Timescale width presets by unit type
  const unitPresets = useMemo(() => {
    switch (timeScale) {
      case 'day':
        return [
          { label: 'Compact (24px)', val: 24 },
          { label: 'Standard (36px)', val: 36 },
          { label: 'Wide (54px)', val: 54 },
          { label: 'Expanded (80px)', val: 80 },
        ];
      case 'week':
        return [
          { label: 'Compact (45px)', val: 45 },
          { label: 'Standard (70px)', val: 70 },
          { label: 'Wide (110px)', val: 110 },
          { label: 'Expanded (160px)', val: 160 },
        ];
      case 'month':
        return [
          { label: 'Compact (60px)', val: 60 },
          { label: 'Standard (120px)', val: 120 },
          { label: 'Wide (180px)', val: 180 },
          { label: 'Expanded (260px)', val: 260 },
        ];
      case 'quarter':
        return [
          { label: 'Compact (100px)', val: 100 },
          { label: 'Standard (180px)', val: 180 },
          { label: 'Wide (280px)', val: 280 },
          { label: 'Expanded (400px)', val: 400 },
        ];
      case 'year':
        return [
          { label: 'Compact (140px)', val: 140 },
          { label: 'Standard (260px)', val: 260 },
          { label: 'Wide (400px)', val: 400 },
          { label: 'Expanded (600px)', val: 600 },
        ];
      default:
        return [];
    }
  }, [timeScale]);

  return (
    <div
      ref={ganttScrollRef}
      onScroll={onScroll}
      onWheel={handleWheel}
      className="flex-1 overflow-auto bg-white select-none relative h-full"
    >
      <div style={{ width: `${totalTimelineWidth}px`, minHeight: '100%' }} className="relative">
        {/* P6 2-Tier Gantt Timescale Header */}
        <div className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200 h-11 flex flex-col shadow-2xs">
          {/* Major Tier (Top): Year / Month / Decade Bands */}
          <div className="flex h-5 relative border-b border-slate-200 bg-slate-100/80">
            {majorTicks.map((maj, i) => (
              <div
                key={i}
                style={{ left: `${maj.x}px`, width: `${maj.width}px` }}
                className="absolute top-0 bottom-0 border-r border-slate-200 flex items-center justify-center text-[11px] font-bold text-blue-700 px-2 truncate"
              >
                {maj.label}
              </div>
            ))}

            {/* Quick Header Timescale Controls on Far Right */}
            <div className="sticky right-3 top-0.5 z-40 flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleFitToScreen}
                className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded border border-slate-300 text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                title="Fit entire project timeline to visible screen"
              >
                <Maximize className="w-3 h-3 text-blue-600" />
                <span>Fit</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowTimescaleMenu(prev => !prev)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded border border-slate-300 text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Timescale Column Width Options"
                >
                  <Sliders className="w-3 h-3 text-blue-600" />
                  <span className="capitalize">{timeScale}: {currentUnitWidth}px</span>
                </button>

                {/* Timescale Dropdown Menu */}
                {showTimescaleMenu && (
                  <div className="absolute right-0 top-6 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-64 z-50 text-xs flex flex-col gap-2.5 animate-in fade-in duration-100">
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                      <span className="capitalize">{timeScale} Column Width</span>
                      <button
                        onClick={() => setShowTimescaleMenu(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {timeScale.toUpperCase()} Width Presets
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {unitPresets.map(p => (
                          <button
                            key={p.val}
                            onClick={() => {
                              if (onUpdateTimescaleWidth) onUpdateTimescaleWidth(timeScale, p.val);
                              setShowTimescaleMenu(false);
                            }}
                            className={`px-2 py-1.5 rounded text-left transition-colors cursor-pointer text-[11px] border ${
                              currentUnitWidth === p.val
                                ? 'bg-blue-100 border-blue-400 text-blue-900 font-bold'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Numeric Exact Pixel Input */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-600 font-medium">Exact Width:</span>
                      <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <input
                          type="number"
                          min={14}
                          max={800}
                          step={5}
                          value={currentUnitWidth}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            if (val && onUpdateTimescaleWidth) onUpdateTimescaleWidth(timeScale, val);
                          }}
                          className="w-14 text-right bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">px/{timeScale}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Minor Tier (Bottom): Days / Weeks / Months / Quarters with Interactive Column Border Dragging */}
          <div className="flex h-6 relative bg-slate-50">
            {minorTicks.map((tick, i) => (
              <div
                key={i}
                style={{ left: `${tick.x}px`, width: `${tick.width}px` }}
                className="absolute top-0 bottom-0 border-r border-slate-200 flex items-center justify-center text-[10px] text-slate-700 font-semibold px-1 truncate group select-none"
              >
                <span>{tick.label}</span>
                {tick.subLabel && <span className="ml-1 text-[9px] text-slate-500">{tick.subLabel}</span>}

                {/* Draggable Timescale Column Divider */}
                <div
                  onMouseDown={(e) => handleStartHeaderResize(e, tick.width)}
                  onDoubleClick={handleFitToScreen}
                  className={`absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize z-30 transition-colors ${
                    isResizingTimescale ? 'bg-blue-600' : 'hover:bg-blue-500/80'
                  }`}
                  title={`Drag to resize ${timeScale} column width (Double-click to fit to screen)`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Grid Vertical Lines */}
        <div className="absolute inset-0 top-11 pointer-events-none">
          {minorTicks.map((tick, i) => (
            <div
              key={i}
              style={{ left: `${tick.x}px`, width: `${tick.width}px` }}
              className="absolute top-0 bottom-0 border-r border-slate-100/80"
            />
          ))}
        </div>

        {/* Rows Container with Embedded SVG */}
        <div className="relative top-0" style={{ height: `${rows.length * 36}px` }}>
          {/* SVG Dependency Lines */}
          {showRelationships && (
            <svg
              className="absolute inset-0 pointer-events-none z-10"
              style={{ width: `${totalTimelineWidth}px`, height: `${rows.length * 36}px` }}
            >
              <defs>
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
                </marker>
              </defs>

              {relationships.map(rel => {
                const predRowIdx = activityRowMap.get(rel.predActivityId);
                const succRowIdx = activityRowMap.get(rel.succActivityId);

                if (predRowIdx === undefined || succRowIdx === undefined) return null;

                const predAct = activityMap.get(rel.predActivityId);
                const succAct = activityMap.get(rel.succActivityId);
                if (!predAct || !succAct) return null;

                const isConnectedToSelected =
                  selectedActivityId === rel.predActivityId || selectedActivityId === rel.succActivityId;

                const predEndX = getXFromDate(predAct.dates.actualFinish || predAct.dates.earlyFinish) + 4;
                const predY = predRowIdx * 36 + 18;

                const succStartX = getXFromDate(succAct.dates.actualStart || succAct.dates.earlyStart);
                const succY = succRowIdx * 36 + 18;

                const midX = Math.max(predEndX + 8, Math.min(predEndX + 24, (predEndX + succStartX) / 2));

                const pathData = `M ${predEndX} ${predY} L ${midX} ${predY} L ${midX} ${succY} L ${succStartX} ${succY}`;

                return (
                  <path
                    key={rel.id}
                    d={pathData}
                    fill="none"
                    stroke={isConnectedToSelected ? '#2563eb' : '#f59e0b'}
                    strokeWidth={isConnectedToSelected ? '2.5' : '1.5'}
                    markerEnd={isConnectedToSelected ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                    className={isConnectedToSelected ? 'opacity-100 z-20' : 'opacity-70'}
                  />
                );
              })}
            </svg>
          )}

          {/* Rows of Bars */}
          {rows.map((row, idx) => {
            const isSelected = row.type === 'activity' && row.activity?.activityId === selectedActivityId;

            if (row.type === 'wbs') {
              const wbsStart = row.rollup?.startDate;
              const wbsFinish = row.rollup?.finishDate;

              if (!wbsStart || !wbsFinish || wbsStart > wbsFinish) {
                return (
                  <div
                    key={row.id}
                    style={{ height: '36px' }}
                    className="w-full border-b border-slate-200/80 bg-slate-100/50"
                  />
                );
              }

              const startX = getXFromDate(wbsStart);
              const endX = getXFromDate(wbsFinish);
              const barWidth = Math.max(16, endX - startX);

              return (
                <div
                  key={row.id}
                  style={{ height: '36px' }}
                  className="w-full border-b border-slate-200/80 bg-slate-100/40 relative flex items-center"
                >
                  {isBarVisible('wbs') && (
                    <div
                      style={{ left: `${startX}px`, width: `${barWidth}px` }}
                      className="absolute h-4 flex items-center group cursor-pointer"
                      title={`${row.wbsNode?.name}: ${wbsStart} to ${wbsFinish} (${row.rollup?.activityCount} activities)`}
                    >
                      {/* P6 WBS Summary Bracket Bar */}
                      <div className="w-full h-2.5 bg-slate-700 rounded-xs shadow-xs relative">
                        <div className="absolute left-0 -bottom-1.5 w-2 h-4 bg-slate-700 [clip-path:polygon(0_0,100%_0,0_100%)]" />
                        <div className="absolute right-0 -bottom-1.5 w-2 h-4 bg-slate-700 [clip-path:polygon(0_0,100%_0,100%_100%)]" />
                      </div>
                      <span className="ml-2.5 text-[11px] font-bold text-slate-800 whitespace-nowrap">
                        {row.wbsNode?.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            const act = row.activity!;
            const isMilestone = act.activityType.includes('Milestone');
            const startX = getXFromDate(act.dates.actualStart || act.dates.earlyStart);
            const endX = getXFromDate(act.dates.actualFinish || act.dates.earlyFinish);
            const barWidth = Math.max(isMilestone ? 14 : 18, endX - startX);

            let barColor = '#84cc16';
            if (act.isCritical && isBarVisible('criticalTask')) {
              barColor = '#ef4444';
            } else if (act.status === 'Completed' && isBarVisible('actualTask')) {
              barColor = '#0284c7';
            } else if (act.activityType === 'Level of Effort' && isBarVisible('loe')) {
              barColor = '#15803d';
            }

            return (
              <div
                key={row.id}
                onClick={() => onSelectActivity(act.activityId)}
                style={{ height: '36px' }}
                className={`w-full border-b border-slate-100 relative flex items-center cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50/60'
                }`}
              >
                {isMilestone ? (
                  <div
                    style={{ left: `${startX - 7}px` }}
                    className="absolute flex items-center group z-10"
                    title={`${act.name} (Milestone): ${act.dates.earlyStart}`}
                  >
                    <div
                      className="w-3.5 h-3.5 rotate-45 rounded-2xs shadow-xs border border-white"
                      style={{ backgroundColor: barColor }}
                    />
                    <span className="ml-3 text-[11px] font-medium text-slate-700 whitespace-nowrap group-hover:font-semibold">
                      {act.name}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{ left: `${startX}px`, width: `${barWidth}px` }}
                    className="absolute h-5 flex items-center group z-10"
                    title={`${act.name}: ${act.dates.earlyStart} to ${act.dates.earlyFinish} (Float: ${act.duration.totalFloat / 8}d)`}
                  >
                    <div
                      className="w-full h-3.5 rounded-xs shadow-xs relative flex items-center overflow-hidden border border-black/10"
                      style={{ backgroundColor: barColor }}
                    >
                      {act.progress.activityPctComplete > 0 && (
                        <div
                          className="h-full bg-blue-700/80"
                          style={{ width: `${act.progress.activityPctComplete}%` }}
                        />
                      )}
                    </div>

                    {isBarVisible('floatTask') && act.duration.totalFloat > 0 && (
                      <div
                        style={{
                          width: `${Math.max(4, getXFromDate(new Date(new Date(act.dates.actualFinish || act.dates.earlyFinish).getTime() + (act.duration.totalFloat * 3600000)).toISOString().split('T')[0]) - endX)}px`,
                        }}
                        className="h-1 bg-slate-900 border-t border-b border-slate-700"
                        title={`Total Float: ${act.duration.totalFloat}h`}
                      />
                    )}

                    <span className="ml-2.5 text-[11px] font-medium text-slate-700 whitespace-nowrap group-hover:font-semibold">
                      {act.name}
                    </span>
                  </div>
                )}

                {/* Baseline Bar Overlay */}
                {selectedBaseline && selectedBaseline.activitiesSnapshot[act.activityId] && (
                  <div
                    style={{
                      left: `${getXFromDate(selectedBaseline.activitiesSnapshot[act.activityId].startDate)}px`,
                      width: `${Math.max(
                        12,
                        getXFromDate(selectedBaseline.activitiesSnapshot[act.activityId].finishDate) -
                          getXFromDate(selectedBaseline.activitiesSnapshot[act.activityId].startDate)
                      )}px`,
                      top: '22px',
                    }}
                    className="absolute h-1.5 bg-amber-400/80 border border-amber-600/50 rounded-2xs"
                    title={`Baseline: ${selectedBaseline.activitiesSnapshot[act.activityId].startDate} to ${selectedBaseline.activitiesSnapshot[act.activityId].finishDate}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
