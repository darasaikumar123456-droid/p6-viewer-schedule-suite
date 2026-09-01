import {
  Project,
  WBSNode,
  Activity,
  Relationship,
  Calendar,
  ScheduleFragment,
} from '../../types/p6';

export function serializeToXER(
  project: Project,
  calendars: Calendar[],
  wbsNodes: WBSNode[],
  activities: Activity[],
  relationships: Relationship[]
): string {
  const lines: string[] = [];
  const exportDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // ERMHDR
  lines.push('ERMSCHEMA\t24.12');
  lines.push(`%T\tEXPORT`);
  lines.push(`%F\texport_date\tversion`);
  lines.push(`%R\t${exportDate}\tScheduleReader Suite Export`);

  // CALENDAR
  lines.push(`%T\tCALENDAR`);
  lines.push(`%F\tclndr_id\tclndr_name\tday_hr_cnt\tweek_hr_cnt\tmonth_hr_cnt\tyear_hr_cnt`);
  for (const c of calendars) {
    const dayHr = c.workHoursPerDay || 8.0;
    const weekHr = dayHr * (c.workDaysPerWeek || 5);
    const monthHr = dayHr * (c.daysPerMonth || 22);
    lines.push(`%R\t${c.id}\t${c.name}\t${dayHr}\t${weekHr}\t${monthHr}\t${monthHr * 12}`);
  }

  // PROJECT
  lines.push(`%T\tPROJECT`);
  lines.push(`%F\tproj_id\tproj_short_name\tproj_name\tplan_start_date\tplan_end_date\tlast_recalc_date\tclndr_id`);
  lines.push(`%R\t${project.id}\t${project.shortId}\t${project.name}\t${project.startDate} 08:00:00\t${project.finishDate} 17:00:00\t${project.dataDate} 08:00:00\t${project.defaultCalendarId}`);

  // PROJWBS
  lines.push(`%T\tPROJWBS`);
  lines.push(`%F\twbs_id\tparent_wbs_id\tproj_id\twbs_short_name\twbs_name\tseq_num`);
  wbsNodes.forEach((w, idx) => {
    lines.push(`%R\t${w.wbsId}\t${w.parentWbsId || ''}\t${project.id}\t${w.shortCode}\t${w.name}\t${idx + 1}`);
  });

  // TASK
  lines.push(`%T\tTASK`);
  lines.push(`%F\ttask_id\tproj_id\twbs_id\tclndr_id\ttask_code\ttask_name\ttask_type\tstatus_code\ttarget_drtn_hr_cnt\tremain_drtn_hr_cnt\tact_drtn_hr_cnt\ttotal_float_hr_cnt\tearly_start_date\tearly_end_date\tlate_start_date\tlate_end_date\tact_start_date\tact_end_date\tphys_complete_pct`);
  activities.forEach((a, idx) => {
    const taskId = `T-${idx + 1000}`;
    const statusCode = a.status === 'Completed' ? 'TK_Complete' : a.status === 'In Progress' ? 'TK_Active' : 'TK_NotStart';
    let taskType = 'TT_Task';
    if (a.activityType === 'Start Milestone') taskType = 'TT_StartMile';
    else if (a.activityType === 'Finish Milestone') taskType = 'TT_FinMile';
    else if (a.activityType === 'Level of Effort') taskType = 'TT_LOE';
    else if (a.activityType === 'WBS Summary') taskType = 'TT_WBS';

    lines.push(
      `%R\t${taskId}\t${project.id}\t${a.wbsId}\t${a.calendarId}\t${a.activityId}\t${a.name}\t${taskType}\t${statusCode}\t${a.duration.plannedDuration}\t${a.duration.remainingDuration}\t${a.duration.actualDuration}\t${a.duration.totalFloat}\t${a.dates.earlyStart} 08:00:00\t${a.dates.earlyFinish} 17:00:00\t${a.dates.lateStart} 08:00:00\t${a.dates.lateFinish} 17:00:00\t${a.dates.actualStart ? a.dates.actualStart + ' 08:00:00' : ''}\t${a.dates.actualFinish ? a.dates.actualFinish + ' 17:00:00' : ''}\t${a.progress.activityPctComplete}`
    );
  });

  // TASKPRED
  lines.push(`%T\tTASKPRED`);
  lines.push(`%F\ttask_pred_id\ttask_id\tpred_task_id\tpred_type\tlag_hr_cnt`);
  relationships.forEach((r, idx) => {
    let predType = 'PR_FS';
    if (r.type === 'SS') predType = 'PR_SS';
    else if (r.type === 'FF') predType = 'PR_FF';
    else if (r.type === 'SF') predType = 'PR_SF';

    lines.push(`%R\t${idx + 1}\t${r.succActivityId}\t${r.predActivityId}\t${predType}\t${r.lagHours}`);
  });

  lines.push('%T\t%E');
  return lines.join('\n');
}

export function serializeFragmentToXER(fragment: ScheduleFragment, targetProjectName = 'Fragment Import'): string {
  const dummyProject: Project = {
    id: `FRAG-${Date.now()}`,
    shortId: 'FRAG',
    name: targetProjectName,
    startDate: new Date().toISOString().split('T')[0],
    finishDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    dataDate: new Date().toISOString().split('T')[0],
    defaultCalendarId: 'CAL-STD',
  };

  const defaultCalendar: Calendar = {
    id: 'CAL-STD',
    name: 'Standard 8h/day',
    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    daysPerMonth: 22,
  };

  return serializeToXER(
    dummyProject,
    [defaultCalendar],
    fragment.wbsNodes,
    fragment.activities,
    fragment.relationships
  );
}
