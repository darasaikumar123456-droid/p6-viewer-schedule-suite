import {
  Project,
  WBSNode,
  Activity,
  Relationship,
  Calendar,
  ActivityType,
  ActivityStatus,
  RelationshipType,
} from '../../types/p6';

export interface ParsedSchedule {
  project: Project;
  calendars: Calendar[];
  wbsNodes: WBSNode[];
  activities: Activity[];
  relationships: Relationship[];
  rawTables?: Record<string, Record<string, string>[]>;
}

// Convert Delphi / P6 day serial number to YYYY-MM-DD
export function p6SerialToDate(serial: number): string {
  const msPerDay = 86400000;
  const epochDiffDays = 25569;
  const jsTimestamp = (serial - epochDiffDays) * msPerDay;
  const d = new Date(jsTimestamp);
  return d.toISOString().split('T')[0];
}

export function parseXER(xerText: string): ParsedSchedule {
  const lines = xerText.split(/\r?\n/);
  const tables: Record<string, Record<string, string>[]> = {};
  
  let currentTable = '';
  let currentFields: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (line.startsWith('%T\t') || line.startsWith('%T ')) {
      currentTable = line.substring(3).trim();
      tables[currentTable] = [];
      currentFields = [];
    } else if (line.startsWith('%F\t') || line.startsWith('%F ')) {
      currentFields = line.substring(3).split('\t').map(f => f.trim());
    } else if (line.startsWith('%R\t') || line.startsWith('%R ')) {
      const values = line.substring(3).split('\t');
      const row: Record<string, string> = {};
      currentFields.forEach((field, idx) => {
        row[field] = values[idx] !== undefined ? values[idx].trim() : '';
      });
      if (currentTable) {
        tables[currentTable].push(row);
      }
    }
  }

  // Parse Calendars
  const calendars: Calendar[] = [];
  const rawCalendars = tables['CALENDAR'] || [];
  if (rawCalendars.length > 0) {
    for (const c of rawCalendars) {
      const dayHr = parseFloat(c['day_hr_cnt']) || 8.0;
      const weekHr = parseFloat(c['week_hr_cnt']) || 48.0;
      const monthHr = parseFloat(c['month_hr_cnt']) || 208.0;
      const workDaysPerWeek = Math.max(1, Math.min(7, Math.round(weekHr / dayHr) || 6));
      const daysPerMonth = Math.max(1, Math.round(monthHr / dayHr) || 26);

      const rawData = c['clndr_data'] || '';
      const dayMatches = [...rawData.matchAll(/\(d\|(\d+)\)/g)].map(m => parseInt(m[1]));
      const holidays = dayMatches.map(p6SerialToDate);

      calendars.push({
        id: c['clndr_id'] || 'CAL-1',
        name: c['clndr_name'] || (c['clndr_id'] === '6593' ? 'AS' : 'Standard Workweek'),
        workHoursPerDay: dayHr,
        workDaysPerWeek,
        daysPerMonth,
        holidays,
      });
    }
  } else {
    calendars.push({
      id: 'CAL-DEFAULT',
      name: 'Standard 8h x 6d',
      workHoursPerDay: 8.0,
      workDaysPerWeek: 6,
      daysPerMonth: 26,
      holidays: [],
    });
  }

  // Parse WBS
  const rawWBS = tables['PROJWBS'] || [];
  const wbsNodes: WBSNode[] = [];
  const wbsMap = new Map<string, WBSNode>();
  const projWbsRoot = rawWBS.find(w => w['proj_node_flag'] === 'Y') || rawWBS[0];

  // Parse Project
  const rawProjects = tables['PROJECT'] || [];
  const pRow = rawProjects[0] || {};
  const projectName = projWbsRoot ? (projWbsRoot['wbs_name'] || projWbsRoot['wbs_short_name'] || pRow['proj_short_name']) : (pRow['proj_name'] || pRow['proj_short_name'] || 'Project Schedule');

  const project: Project = {
    id: pRow['proj_id'] || 'PR-1',
    shortId: pRow['proj_short_name'] || 'PR',
    name: projectName,
    startDate: formatP6Date(pRow['plan_start_date']) || '2024-04-01',
    finishDate: formatP6Date(pRow['plan_end_date']) || formatP6Date(pRow['scd_end_date']) || '2028-03-31',
    dataDate: formatP6Date(pRow['last_recalc_date']) || formatP6Date(pRow['plan_start_date']) || '2025-10-31',
    defaultCalendarId: pRow['clndr_id'] || calendars[0]?.id || '6593',
    activityCount: (tables['TASK'] || []).length,
  };

  // Build raw WBS nodes list
  const existingWbsIds = new Set<string>();
  for (const w of rawWBS) {
    if (w['wbs_id']) {
      existingWbsIds.add(w['wbs_id']);
    }
  }

  for (const w of rawWBS) {
    const rawParentId = w['parent_wbs_id'];
    // If parent_wbs_id is empty, matches self, or points to an EPS/external node not in PROJWBS, treat as root (null)
    const parentId = rawParentId && rawParentId !== w['wbs_id'] && existingWbsIds.has(rawParentId)
      ? rawParentId
      : null;

    const node: WBSNode = {
      wbsId: w['wbs_id'] || '',
      parentWbsId: parentId,
      shortCode: w['wbs_short_name'] || '',
      name: w['wbs_name'] || w['wbs_short_name'] || 'WBS Node',
      level: 1,
      projectId: project.id,
      expanded: true,
    };
    wbsNodes.push(node);
    wbsMap.set(node.wbsId, node);
  }

  // Calculate hierarchical levels safely
  for (const node of wbsNodes) {
    let level = 1;
    let curr = node.parentWbsId ? wbsMap.get(node.parentWbsId) : null;
    const visited = new Set<string>();
    while (curr && !visited.has(curr.wbsId)) {
      visited.add(curr.wbsId);
      level++;
      curr = curr.parentWbsId ? wbsMap.get(curr.parentWbsId) : null;
    }
    node.level = level;
  }

  // Fallback if no WBS nodes exist
  if (wbsNodes.length === 0) {
    const defaultRoot: WBSNode = {
      wbsId: 'WBS-ROOT',
      parentWbsId: null,
      shortCode: project.shortId || 'WBS.1',
      name: project.name || 'Main Project',
      level: 1,
      projectId: project.id,
      expanded: true,
    };
    wbsNodes.push(defaultRoot);
    wbsMap.set(defaultRoot.wbsId, defaultRoot);
  }

  // Parse Tasks / Activities
  const rawTasks = tables['TASK'] || [];
  const activities: Activity[] = [];
  const taskIdToCodeMap = new Map<string, string>();

  for (const t of rawTasks) {
    const typeStr = t['task_type'] || 'TT_Task';
    let activityType: ActivityType = 'Task Dependent';
    if (typeStr.includes('Mile') || typeStr === 'TT_StartMile') activityType = 'Start Milestone';
    else if (typeStr === 'TT_FinMile') activityType = 'Finish Milestone';
    else if (typeStr === 'TT_LOE') activityType = 'Level of Effort';
    else if (typeStr === 'TT_WBS') activityType = 'WBS Summary';

    const statusCode = t['status_code'] || 'TK_NotStart';
    let status: ActivityStatus = 'Not Started';
    if (statusCode === 'TK_Active') status = 'In Progress';
    else if (statusCode === 'TK_Complete') status = 'Completed';

    const plannedHours = parseFloat(t['target_drtn_hr_cnt']) || 0;
    const remainHours = parseFloat(t['remain_drtn_hr_cnt']) || plannedHours;
    const actHours = parseFloat(t['act_drtn_hr_cnt']) || 0;
    const totalFloatHours = parseFloat(t['total_float_hr_cnt']) || 0;

    const earlyStart = formatP6Date(t['early_start_date']) || formatP6Date(t['target_start_date']) || formatP6Date(t['act_start_date']) || project.startDate;
    const earlyFinish = formatP6Date(t['early_end_date']) || formatP6Date(t['target_end_date']) || formatP6Date(t['act_end_date']) || earlyStart;
    const lateStart = formatP6Date(t['late_start_date']) || earlyStart;
    const lateFinish = formatP6Date(t['late_end_date']) || earlyFinish;
    const actualStart = t['act_start_date'] ? formatP6Date(t['act_start_date']) : null;
    const actualFinish = t['act_end_date'] ? formatP6Date(t['act_end_date']) : null;

    const isCritical = totalFloatHours <= 0 && status !== 'Completed';
    const actCode = t['task_code'] || t['task_id'] || `A${activities.length + 1000}`;

    if (t['task_id']) {
      taskIdToCodeMap.set(t['task_id'], actCode);
    }

    // Attach activity to valid WBS node
    const taskWbsId = t['wbs_id'];
    const resolvedWbsId = taskWbsId && wbsMap.has(taskWbsId)
      ? taskWbsId
      : (wbsNodes[0]?.wbsId || '1');

    const act: Activity = {
      activityId: actCode,
      name: t['task_name'] || 'Activity',
      wbsId: resolvedWbsId,
      projectId: project.id,
      activityType,
      status,
      isCritical,
      isLongestPath: isCritical,
      calendarId: t['clndr_id'] || project.defaultCalendarId,
      assignedResource: t['resource_name'] || undefined,
      dates: {
        earlyStart,
        earlyFinish,
        lateStart,
        lateFinish,
        actualStart,
        actualFinish,
      },
      duration: {
        plannedDuration: plannedHours,
        remainingDuration: remainHours,
        actualDuration: actHours,
        atCompletionDuration: status === 'Completed' ? actHours : actHours + remainHours,
        totalFloat: totalFloatHours,
        freeSlack: parseFloat(t['free_float_hr_cnt']) || 0,
      },
      progress: {
        activityPctComplete: parseFloat(t['phys_complete_pct']) || (status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0),
        pctCompleteType: 'Duration',
      },
    };

    activities.push(act);
  }

  // Parse Relationships
  const rawPreds = tables['TASKPRED'] || [];
  const relationships: Relationship[] = [];

  for (let i = 0; i < rawPreds.length; i++) {
    const p = rawPreds[i];
    let type: RelationshipType = 'FS';
    const predType = p['pred_type'] || 'PR_FS';
    if (predType.includes('SS')) type = 'SS';
    else if (predType.includes('FF')) type = 'FF';
    else if (predType.includes('SF')) type = 'SF';

    const predTaskId = p['pred_task_id'] || p['task_pred_id'];
    const succTaskId = p['task_id'];

    const predCode = taskIdToCodeMap.get(predTaskId) || predTaskId;
    const succCode = taskIdToCodeMap.get(succTaskId) || succTaskId;

    if (predCode && succCode) {
      relationships.push({
        id: `REL-${i + 1}`,
        predActivityId: predCode,
        succActivityId: succCode,
        type,
        lagHours: parseFloat(p['lag_hr_cnt']) || 0,
        isDriving: p['driving_flag'] === 'Y' || true,
      });
    }
  }

  return {
    project,
    calendars,
    wbsNodes,
    activities,
    relationships,
    rawTables: tables,
  };
}

function formatP6Date(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const cleanStr = dateStr.trim();
    if (cleanStr.length >= 10) {
      const d = new Date(cleanStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  } catch (e) {
    // fallback
  }
  return dateStr.substring(0, 10);
}
