import { Activity, Relationship, Calendar, Project } from '../../types/p6';

export interface CPMResult {
  activities: Activity[];
  projectFinishDate: string;
  criticalActivityIds: string[];
  totalProjectFloat: number;
  varianceDays: number;
}

export function runCPM(
  activities: Activity[],
  relationships: Relationship[],
  calendars: Calendar[],
  project: Project
): CPMResult {
  const calMap = new Map<string, Calendar>();
  calendars.forEach(c => calMap.set(c.id, c));
  const defaultCal: Calendar = calendars[0] || {
    id: 'CAL-DEF',
    name: 'Default 8h/day',
    workHoursPerDay: 8,
    workDaysPerWeek: 6,
    daysPerMonth: 26,
    holidays: [],
  };

  const isHolidayOrWeekend = (d: Date, cal: Calendar): boolean => {
    const dayOfWeek = d.getDay(); // 0: Sun, 6: Sat
    const isWeekend = (cal.workDaysPerWeek ?? 5) <= 5 ? (dayOfWeek === 0 || dayOfWeek === 6) : (dayOfWeek === 0);
    if (isWeekend) return true;

    if (cal.holidays && cal.holidays.length > 0) {
      const dateStr = d.toISOString().split('T')[0];
      return cal.holidays.includes(dateStr);
    }
    return false;
  };

  // Helper date functions
  const addWorkDays = (startDateStr: string, durationHours: number, cal: Calendar): string => {
    if (!startDateStr) return project.startDate;
    const hoursPerDay = cal.workHoursPerDay || 8;
    const days = Math.max(0, Math.ceil(durationHours / hoursPerDay));
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return project.startDate;
    if (days === 0) return startDateStr;

    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      if (!isHolidayOrWeekend(date, cal)) {
        added++;
      }
    }
    return date.toISOString().split('T')[0];
  };

  const subtractWorkDays = (endDateStr: string, durationHours: number, cal: Calendar): string => {
    if (!endDateStr) return project.finishDate;
    const hoursPerDay = cal.workHoursPerDay || 8;
    const days = Math.max(0, Math.ceil(durationHours / hoursPerDay));
    const date = new Date(endDateStr);
    if (isNaN(date.getTime())) return project.finishDate;
    if (days === 0) return endDateStr;

    let subtracted = 0;
    while (subtracted < days) {
      date.setDate(date.getDate() - 1);
      if (!isHolidayOrWeekend(date, cal)) {
        subtracted++;
      }
    }
    return date.toISOString().split('T')[0];
  };

  const getWorkDaysDiffHours = (d1Str: string, d2Str: string, cal: Calendar): number => {
    if (!d1Str || !d2Str) return 0;
    const d1 = new Date(d1Str);
    const d2 = new Date(d2Str);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    if (d1 >= d2) return 0;

    let count = 0;
    const curr = new Date(d1);
    while (curr < d2) {
      curr.setDate(curr.getDate() + 1);
      if (!isHolidayOrWeekend(curr, cal)) {
        count++;
      }
    }
    return count * (cal.workHoursPerDay || 8);
  };

  // Clone activities
  const clonedActivities: Activity[] = activities.map(a => {
    const plannedHrs = a.duration.plannedDuration || 8;
    const actHrs = a.duration.actualDuration || (a.status === 'Completed' ? plannedHrs : 0);
    const remHrs = a.status === 'Completed' ? 0 : (a.duration.remainingDuration !== undefined ? a.duration.remainingDuration : plannedHrs);
    
    return {
      ...a,
      dates: { ...a.dates },
      duration: {
        ...a.duration,
        plannedDuration: plannedHrs,
        actualDuration: actHrs,
        remainingDuration: remHrs,
        atCompletionDuration: a.status === 'Completed' ? actHrs : actHrs + remHrs,
      },
      progress: {
        ...a.progress,
        activityPctComplete: a.status === 'Completed' ? 100 : a.status === 'In Progress' ? Math.max(10, a.progress.activityPctComplete || 50) : 0,
      }
    };
  });

  const actMap = new Map<string, Activity>();
  clonedActivities.forEach(a => actMap.set(a.activityId, a));

  // Build adjacency graph
  const predecessorsMap = new Map<string, Relationship[]>();
  const successorsMap = new Map<string, Relationship[]>();

  relationships.forEach(rel => {
    if (!predecessorsMap.has(rel.succActivityId)) {
      predecessorsMap.set(rel.succActivityId, []);
    }
    predecessorsMap.get(rel.succActivityId)!.push(rel);

    if (!successorsMap.has(rel.predActivityId)) {
      successorsMap.set(rel.predActivityId, []);
    }
    successorsMap.get(rel.predActivityId)!.push(rel);
  });

  // --- STEP 1: INITIALIZE DATES ACCORDING TO STATUS & ACTUALS ---
  clonedActivities.forEach(act => {
    const cal = calMap.get(act.calendarId) || defaultCal;

    if (act.status === 'Completed') {
      const aStart = act.dates.actualStart || act.dates.earlyStart || project.startDate;
      const aFinish = act.dates.actualFinish || act.dates.earlyFinish || addWorkDays(aStart, act.duration.actualDuration || act.duration.plannedDuration, cal);
      act.dates.earlyStart = aStart;
      act.dates.earlyFinish = aFinish;
      act.dates.actualStart = aStart;
      act.dates.actualFinish = aFinish;
    } else if (act.status === 'In Progress') {
      const aStart = act.dates.actualStart || project.dataDate || project.startDate;
      act.dates.actualStart = aStart;
      act.dates.earlyStart = aStart;
      const baseForecastStart = (project.dataDate && project.dataDate > aStart) ? project.dataDate : aStart;
      act.dates.earlyFinish = addWorkDays(baseForecastStart, act.duration.remainingDuration, cal);
    } else {
      act.dates.earlyStart = project.startDate;
      act.dates.earlyFinish = addWorkDays(project.startDate, act.duration.plannedDuration, cal);
    }
  });

  // --- STEP 2: FORWARD PASS ---
  const maxPasses = Math.max(10, clonedActivities.length);
  let changed = true;
  let pass = 0;

  while (changed && pass < maxPasses) {
    changed = false;
    pass++;

    clonedActivities.forEach(act => {
      if (act.status === 'Completed') return;

      const preds = predecessorsMap.get(act.activityId) || [];
      if (preds.length === 0) return;

      const cal = calMap.get(act.calendarId) || defaultCal;
      let earliestCandidateStart = project.startDate;

      preds.forEach(rel => {
        const predAct = actMap.get(rel.predActivityId);
        if (!predAct) return;

        const predFinish = predAct.status === 'Completed' && predAct.dates.actualFinish
          ? predAct.dates.actualFinish
          : predAct.dates.earlyFinish;

        const predStart = predAct.status !== 'Not Started' && predAct.dates.actualStart
          ? predAct.dates.actualStart
          : predAct.dates.earlyStart;

        let linkStart = project.startDate;

        if (rel.type === 'FS') {
          linkStart = addWorkDays(predFinish, rel.lagHours, cal);
        } else if (rel.type === 'SS') {
          linkStart = addWorkDays(predStart, rel.lagHours, cal);
        } else if (rel.type === 'FF') {
          const linkFinish = addWorkDays(predFinish, rel.lagHours, cal);
          linkStart = subtractWorkDays(linkFinish, act.duration.plannedDuration, cal);
        } else if (rel.type === 'SF') {
          const linkFinish = addWorkDays(predStart, rel.lagHours, cal);
          linkStart = subtractWorkDays(linkFinish, act.duration.plannedDuration, cal);
        }

        if (linkStart > earliestCandidateStart) {
          earliestCandidateStart = linkStart;
        }
      });

      if (act.status === 'In Progress') {
        const currentFinish = act.dates.earlyFinish;
        const newFinish = addWorkDays(
          earliestCandidateStart > project.dataDate ? earliestCandidateStart : project.dataDate,
          act.duration.remainingDuration,
          cal
        );
        if (newFinish !== currentFinish && newFinish > currentFinish) {
          act.dates.earlyFinish = newFinish;
          changed = true;
        }
      } else {
        if (earliestCandidateStart !== act.dates.earlyStart && earliestCandidateStart > act.dates.earlyStart) {
          act.dates.earlyStart = earliestCandidateStart;
          act.dates.earlyFinish = addWorkDays(earliestCandidateStart, act.duration.plannedDuration, cal);
          changed = true;
        }
      }
    });
  }

  // Determine overall forecast project finish date
  let maxProjectFinish = project.startDate;
  clonedActivities.forEach(a => {
    const f = a.dates.earlyFinish || a.dates.actualFinish;
    if (f && f > maxProjectFinish) {
      maxProjectFinish = f;
    }
  });

  // --- STEP 3: BACKWARD PASS ---
  clonedActivities.forEach(act => {
    const cal = calMap.get(act.calendarId) || defaultCal;
    act.dates.lateFinish = maxProjectFinish;
    act.dates.lateStart = subtractWorkDays(maxProjectFinish, act.duration.remainingDuration || act.duration.plannedDuration, cal);
  });

  changed = true;
  pass = 0;
  while (changed && pass < maxPasses) {
    changed = false;
    pass++;

    clonedActivities.forEach(act => {
      const succs = successorsMap.get(act.activityId) || [];
      if (succs.length === 0) return;

      const cal = calMap.get(act.calendarId) || defaultCal;
      let latestCandidateFinish = maxProjectFinish;

      succs.forEach(rel => {
        const succAct = actMap.get(rel.succActivityId);
        if (!succAct) return;

        let linkFinish = maxProjectFinish;

        if (rel.type === 'FS') {
          linkFinish = subtractWorkDays(succAct.dates.lateStart, rel.lagHours, cal);
        } else if (rel.type === 'SS') {
          const linkStart = subtractWorkDays(succAct.dates.lateStart, rel.lagHours, cal);
          linkFinish = addWorkDays(linkStart, act.duration.plannedDuration, cal);
        } else if (rel.type === 'FF') {
          linkFinish = subtractWorkDays(succAct.dates.lateFinish, rel.lagHours, cal);
        } else if (rel.type === 'SF') {
          const linkStart = subtractWorkDays(succAct.dates.lateFinish, rel.lagHours, cal);
          linkFinish = addWorkDays(linkStart, act.duration.plannedDuration, cal);
        }

        if (linkFinish < latestCandidateFinish) {
          latestCandidateFinish = linkFinish;
        }
      });

      if (latestCandidateFinish !== act.dates.lateFinish && latestCandidateFinish < act.dates.lateFinish) {
        act.dates.lateFinish = latestCandidateFinish;
        act.dates.lateStart = subtractWorkDays(latestCandidateFinish, act.duration.remainingDuration || act.duration.plannedDuration, cal);
        changed = true;
      }
    });
  }

  // --- STEP 4: CALCULATE FLOAT AND CRITICAL PATH ---
  const criticalActivityIds: string[] = [];

  clonedActivities.forEach(a => {
    const cal = calMap.get(a.calendarId) || defaultCal;
    if (a.status === 'Completed') {
      a.duration.totalFloat = 0;
      a.isCritical = false;
      a.isLongestPath = false;
    } else {
      const tfHours = getWorkDaysDiffHours(a.dates.earlyFinish, a.dates.lateFinish, cal);
      a.duration.totalFloat = tfHours;
      a.isCritical = tfHours <= 0;
      a.isLongestPath = a.isCritical;
      if (a.isCritical) {
        criticalActivityIds.push(a.activityId);
      }
    }
  });

  const origFinish = new Date(project.finishDate).getTime();
  const newFinish = new Date(maxProjectFinish).getTime();
  const varianceDays = isNaN(origFinish) || isNaN(newFinish) ? 0 : Math.round((newFinish - origFinish) / (1000 * 60 * 60 * 24));

  return {
    activities: clonedActivities,
    projectFinishDate: maxProjectFinish,
    criticalActivityIds,
    totalProjectFloat: 0,
    varianceDays,
  };
}
