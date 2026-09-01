import { WBSNode, Activity, ActivityStatus } from '../../types/p6';

export interface WBSRollup {
  startDate: string;
  finishDate: string;
  lateStartDate: string;
  lateFinishDate: string;
  actualStartDate: string | null;
  actualFinishDate: string | null;
  totalFloat: number;
  plannedDuration: number;
  remainingDuration: number;
  actualDuration: number;
  atCompletionDuration: number;
  activityPctComplete: number;
  status: ActivityStatus;
  activityCount: number;
}

export function computeWBSRollups(
  wbsNodes: WBSNode[],
  activities: Activity[]
): Map<string, WBSRollup> {
  // Map children WBS nodes
  const wbsChildrenMap = new Map<string, string[]>();
  wbsNodes.forEach(w => {
    if (w.parentWbsId) {
      if (!wbsChildrenMap.has(w.parentWbsId)) wbsChildrenMap.set(w.parentWbsId, []);
      wbsChildrenMap.get(w.parentWbsId)!.push(w.wbsId);
    }
  });

  // Map activities directly under each WBS
  const activitiesByWbsId = new Map<string, Activity[]>();
  activities.forEach(a => {
    if (!activitiesByWbsId.has(a.wbsId)) activitiesByWbsId.set(a.wbsId, []);
    activitiesByWbsId.get(a.wbsId)!.push(a);
  });

  // Find all descendant WBS IDs for each node
  const getDescendantWbsIds = (rootWbsId: string): string[] => {
    const result: string[] = [rootWbsId];
    const stack: string[] = [rootWbsId];
    const visited = new Set<string>([rootWbsId]);

    while (stack.length > 0) {
      const curr = stack.pop()!;
      const children = wbsChildrenMap.get(curr) || [];
      for (const ch of children) {
        if (!visited.has(ch)) {
          visited.add(ch);
          result.push(ch);
          stack.push(ch);
        }
      }
    }
    return result;
  };

  const rollupMap = new Map<string, WBSRollup>();

  wbsNodes.forEach(node => {
    const descendantWbsIds = getDescendantWbsIds(node.wbsId);
    const descendantActs: Activity[] = [];

    descendantWbsIds.forEach(wId => {
      const acts = activitiesByWbsId.get(wId) || [];
      descendantActs.push(...acts);
    });

    if (descendantActs.length === 0) {
      rollupMap.set(node.wbsId, {
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
      });
      return;
    }

    let minStart = '9999-99-99';
    let maxFinish = '0000-00-00';
    let minLateStart = '9999-99-99';
    let maxLateFinish = '0000-00-00';
    let minActualStart: string | null = null;
    let maxActualFinish: string | null = null;
    let minFloat = 999999;
    let totalPlannedHrs = 0;
    let totalActHrs = 0;
    let totalRemHrs = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    descendantActs.forEach(a => {
      const start = a.dates.actualStart || a.dates.earlyStart;
      const finish = a.dates.actualFinish || a.dates.earlyFinish;

      if (start && start < minStart) minStart = start;
      if (finish && finish > maxFinish) maxFinish = finish;

      if (a.dates.lateStart && a.dates.lateStart < minLateStart) minLateStart = a.dates.lateStart;
      if (a.dates.lateFinish && a.dates.lateFinish > maxLateFinish) maxLateFinish = a.dates.lateFinish;

      if (a.dates.actualStart) {
        if (!minActualStart || a.dates.actualStart < minActualStart) {
          minActualStart = a.dates.actualStart;
        }
      }

      if (a.dates.actualFinish) {
        if (!maxActualFinish || a.dates.actualFinish > maxActualFinish) {
          maxActualFinish = a.dates.actualFinish;
        }
      }

      if (a.duration.totalFloat !== undefined && a.duration.totalFloat < minFloat) {
        minFloat = a.duration.totalFloat;
      }

      totalPlannedHrs += a.duration.plannedDuration || 0;
      totalActHrs += a.duration.actualDuration || 0;
      totalRemHrs += a.duration.remainingDuration || 0;

      if (a.status === 'Completed') completedCount++;
      else if (a.status === 'In Progress') inProgressCount++;
    });

    const totalAtCompHrs = totalActHrs + totalRemHrs;
    const progressPct = totalAtCompHrs > 0
      ? Math.round((totalActHrs / totalAtCompHrs) * 100)
      : (completedCount === descendantActs.length ? 100 : 0);

    let wbsStatus: ActivityStatus = 'Not Started';
    if (completedCount === descendantActs.length && descendantActs.length > 0) {
      wbsStatus = 'Completed';
    } else if (inProgressCount > 0 || completedCount > 0) {
      wbsStatus = 'In Progress';
    }

    rollupMap.set(node.wbsId, {
      startDate: minStart !== '9999-99-99' ? minStart : '',
      finishDate: maxFinish !== '0000-00-00' ? maxFinish : '',
      lateStartDate: minLateStart !== '9999-99-99' ? minLateStart : '',
      lateFinishDate: maxLateFinish !== '0000-00-00' ? maxLateFinish : '',
      actualStartDate: minActualStart,
      actualFinishDate: completedCount === descendantActs.length ? maxActualFinish : null,
      totalFloat: minFloat !== 999999 ? minFloat : 0,
      plannedDuration: totalPlannedHrs,
      remainingDuration: totalRemHrs,
      actualDuration: totalActHrs,
      atCompletionDuration: totalAtCompHrs,
      activityPctComplete: progressPct,
      status: wbsStatus,
      activityCount: descendantActs.length,
    });
  });

  return rollupMap;
}
