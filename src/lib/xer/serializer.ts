import {
  Project,
  WBSNode,
  Activity,
  Relationship,
  Calendar,
  ScheduleFragment,
} from '../../types/p6';

function formatP6DateTime(dateStr: string | null | undefined, defaultTime = '08:00'): string {
  if (!dateStr || !dateStr.trim()) return '';
  const trimmed = dateStr.trim();
  // If format is YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed} ${defaultTime}`;
  }
  // If format is YYYY-MM-DD HH:MM:SS
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.substring(0, 16);
  }
  // If format is already YYYY-MM-DD HH:MM
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  // Try fallback date parsing
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${defaultTime}`;
    }
  } catch {
    // ignore
  }
  return trimmed;
}

function cleanP6Text(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\x80\x94/g, '-')
    .trim();
}

export function serializeToXER(
  project: Project,
  calendars: Calendar[],
  wbsNodes: WBSNode[],
  activities: Activity[],
  relationships: Relationship[]
): string {
  const lines: string[] = [];
  const today = new Date().toISOString().split('T')[0];

  // 1. ERMHDR - Header line with version 19.12 (compatible across P6 18, 19, 20, 21, 22, 23, 24)
  lines.push(`ERMHDR\t19.12\t${today}\tProject\tadmin\tdsai\tdbxDatabaseNoName\tProject Management\tINR`);

  // 2. CURRTYPE
  lines.push('%T\tCURRTYPE');
  lines.push('%F\tcurr_id\tdecimal_digit_cnt\tcurr_symbol\tdecimal_symbol\tdigit_group_symbol\tpos_curr_fmt_type\tneg_curr_fmt_type\tcurr_type\tcurr_short_name\tgroup_digit_cnt\tbase_exch_rate');
  lines.push('%R\t1\t2\t₹\t.\t,\t#1.1\t(#1.1)\tINR\tINR\t3\t1');
  lines.push('%R\t2\t2\t$\t.\t,\t#1.1\t(#1.1)\tUS Dollar\tUSD\t3\t0.012');

  // 3. OBS
  lines.push('%T\tOBS');
  lines.push('%F\tobs_id\tparent_obs_id\tguid\tseq_num\tobs_name\tobs_descr');
  lines.push('%R\t540\t\t\t0\tEnterprise\t<html><body>Enterprise</body></html>');

  // Numeric Project ID
  const projId = project.id && /^\d+$/.test(project.id) ? project.id : '5265';
  const defaultCalId = calendars[0]?.id && /^\d+$/.test(calendars[0].id)
    ? calendars[0].id
    : project.defaultCalendarId && /^\d+$/.test(project.defaultCalendarId)
      ? project.defaultCalendarId
      : '7393';

  const planStart = formatP6DateTime(project.startDate || '2023-02-18', '08:00');
  const planFinish = formatP6DateTime(project.finishDate || '2023-10-21', '18:00');
  const dataDate = formatP6DateTime(project.dataDate || project.startDate || '2023-02-18', '08:00');

  // 4. PROJECT
  lines.push('%T\tPROJECT');
  lines.push('%F\tproj_id\tfy_start_month_num\trsrc_self_add_flag\tallow_complete_flag\trsrc_multi_assign_flag\tcheckout_flag\tproject_flag\tstep_complete_flag\tcost_qty_recalc_flag\tbatch_sum_flag\tname_sep_char\tdef_complete_pct_type\tproj_short_name\tacct_id\torig_proj_id\tsource_proj_id\tbase_type_id\tclndr_id\tsum_base_proj_id\ttask_code_base\ttask_code_step\tpriority_num\twbs_max_sum_level\tstrgy_priority_num\tlast_checksum\tcritical_drtn_hr_cnt\tdef_cost_per_qty\tlast_recalc_date\tplan_start_date\tplan_end_date\tscd_end_date\tadd_date\tlast_tasksum_date\tfcst_start_date\tdef_duration_type\ttask_code_prefix\tguid\tdef_qty_type\tadd_by_name\tweb_local_root_path\tproj_url\tdef_rate_type\tadd_act_remain_flag\tact_this_per_link_flag\tdef_task_type\tact_pct_link_flag\tcritical_path_type\ttask_code_prefix_flag\tdef_rollup_dates_flag\tuse_project_baseline_flag\trem_target_link_flag\treset_planned_flag\tallow_neg_act_flag\tsum_assign_level\tlast_fin_dates_id\tlast_baseline_update_date\tcr_external_key\tapply_actuals_date\tlocation_id\tloaded_scope_level\texport_flag\tnew_fin_dates_id\tbaselines_to_export\tbaseline_names_to_export\tnext_data_date\tclose_period_flag\tsum_refresh_date\ttrsrcsum_loaded');
  lines.push(`%R\t${projId}\t1\tY\tY\tY\tN\tY\tN\tN\tY\t.\tCP_Drtn\t${cleanP6Text(project.shortId || 'PROJ')}\t\t\t\t\t${defaultCalId}\t\t1000\t10\t10\t2\t500\t\t0\t0.0000\t${dataDate}\t${planStart}\t\t${planFinish}\t${today} 08:00\t\t\tDT_FixedDUR2\tA\tnIP7eBwrAkSYdDxqKtVOXA\tQT_Hour\tadmin\t\t\tCOST_PER_QTY\tN\tY\tTT_Task\tY\tCT_TotFloat\tY\tY\tY\tY\tN\tN\tSL_Taskrsrc\t\t\t\t\t\t7\tY\t\t\t\t\t\t\t`);

  // 5. CALENDAR
  lines.push('%T\tCALENDAR');
  lines.push('%F\tclndr_id\tdefault_flag\tclndr_name\tproj_id\tbase_clndr_id\tlast_chng_date\tclndr_type\tday_hr_cnt\tweek_hr_cnt\tmonth_hr_cnt\tyear_hr_cnt\trsrc_private\tclndr_data');
  const calList = calendars.length > 0 ? calendars : [
    { id: defaultCalId, name: 'Standard Calendar', workHoursPerDay: 8, workDaysPerWeek: 6, daysPerMonth: 26, holidays: [] }
  ];
  calList.forEach((c, idx) => {
    const cId = c.id && /^\d+$/.test(c.id) ? c.id : String(7393 + idx);
    const dayHr = c.workHoursPerDay || 8.0;
    const weekHr = dayHr * (c.workDaysPerWeek || 6);
    const monthHr = dayHr * (c.daysPerMonth || 26);
    const isDef = idx === 0 ? 'Y' : 'N';
    lines.push(`%R\t${cId}\t${isDef}\t${cleanP6Text(c.name || 'Standard Calendar')}\t\t\t${today} 00:00\tCA_Base\t${dayHr}\t${weekHr}\t${monthHr}\t${monthHr * 12}\tN\t(0||CalendarData()( (0||DaysOfWeek()( (0||1()()) (0||2()( (0||0(s|08:00|f|18:00)()))) (0||3()( (0||0(s|08:00|f|18:00)()))) (0||4()( (0||0(s|08:00|f|18:00)()))) (0||5()( (0||0(s|08:00|f|18:00)()))) (0||6()( (0||0(s|08:00|f|18:00)()))) (0||7()( (0||0(s|08:00|f|18:00)())))))`);
  });

  // 6. SCHEDOPTIONS
  lines.push('%T\tSCHEDOPTIONS');
  lines.push('%F\tschedoptions_id\tproj_id\tsched_outer_depend_type\tsched_open_critical_flag\tsched_lag_early_start_flag\tsched_retained_logic\tsched_setplantoforecast\tsched_float_type\tsched_calendar_on_relationship_lag\tsched_use_expect_end_flag\tsched_progress_override\tlevel_float_thrs_cnt\tlevel_outer_assign_flag\tlevel_outer_assign_priority\tlevel_over_alloc_pct\tlevel_within_float_flag\tlevel_keep_sched_date_flag\tlevel_all_rsrc_flag\tsched_use_project_end_date_for_float\tenable_multiple_longest_path_calc\tlimit_multiple_longest_path_calc\tmax_multiple_longest_path\tuse_total_float_multiple_longest_paths\tkey_activity_for_multiple_longest_paths\tLevelPriorityList');
  lines.push(`%R\t1\t${projId}\tSD_Both\tN\tY\tY\tN\tFT_FF\trcal_Predecessor\tY\tN\t0\tN\t5\t25\tN\tY\tY\tY\tN\tY\t10\tY\t\tpriority_type,ASC  `);

  // 7. PROJWBS - Map string IDs to integers and set proj_node_flag
  const wbsIdMap = new Map<string, string>();
  let nextWbsInt = 29100;
  wbsNodes.forEach((w) => {
    if (w.wbsId && /^\d+$/.test(w.wbsId)) {
      wbsIdMap.set(w.wbsId, w.wbsId);
    } else if (w.wbsId) {
      wbsIdMap.set(w.wbsId, String(nextWbsInt++));
    }
  });

  lines.push('%T\tPROJWBS');
  lines.push('%F\twbs_id\tproj_id\tobs_id\tseq_num\test_wt\tproj_node_flag\tsum_data_flag\tstatus_code\twbs_short_name\twbs_name\tphase_id\tparent_wbs_id\tev_user_pct\tev_etc_user_value\torig_cost\tindep_remain_total_cost\tann_dscnt_rate_pct\tdscnt_period_type\tindep_remain_work_qty\tanticip_start_date\tanticip_end_date\tev_compute_type\tev_etc_compute_type\tguid\ttmpl_guid\tplan_open_state');

  wbsNodes.forEach((w, idx) => {
    const isRoot = idx === 0 || !w.parentWbsId;
    const resolvedId = wbsIdMap.get(w.wbsId) || String(29080 + idx);
    const resolvedParentId = isRoot ? '' : (wbsIdMap.get(w.parentWbsId || '') || '');
    const projNodeFlag = isRoot ? 'Y' : 'N';
    const shortCode = cleanP6Text(w.shortCode || String(idx + 1));
    const wName = cleanP6Text(w.name || shortCode);

    lines.push(`%R\t${resolvedId}\t${projId}\t540\t${idx + 1}\t1\t${projNodeFlag}\tN\tWS_Open\t${shortCode}\t${wName}\t\t${resolvedParentId}\t6\t0.88\t0.0000\t0.0000\t\t\t\t\t\tEC_Cmp_pct\tEE_Rem_hr\t\t\t`);
  });

  // 8. TASK - Assign numeric task_id and map activityId
  const activityIdToTaskIdMap = new Map<string, string>();
  let nextTaskInt = 126000;
  activities.forEach((a, idx) => {
    const numericId = String(nextTaskInt + idx);
    activityIdToTaskIdMap.set(a.activityId, numericId);
  });

  lines.push('%T\tTASK');
  lines.push('%F\ttask_id\tproj_id\twbs_id\tclndr_id\tphys_complete_pct\trev_fdbk_flag\test_wt\tlock_plan_flag\tauto_compute_act_flag\tcomplete_pct_type\ttask_type\tduration_type\tstatus_code\ttask_code\ttask_name\trsrc_id\ttotal_float_hr_cnt\tfree_float_hr_cnt\tremain_drtn_hr_cnt\tact_work_qty\tremain_work_qty\ttarget_work_qty\ttarget_drtn_hr_cnt\ttarget_equip_qty\tact_equip_qty\tremain_equip_qty\tcstr_date\tact_start_date\tact_end_date\tlate_start_date\tlate_end_date\texpect_end_date\tearly_start_date\tearly_end_date\trestart_date\treend_date\ttarget_start_date\ttarget_end_date\trem_late_start_date\trem_late_end_date\tcstr_type\tpriority_type\tsuspend_date\tresume_date\tfloat_path\tfloat_path_order\tguid\ttmpl_guid\tcstr_date2\tcstr_type2\tdriving_path_flag\tact_this_per_work_qty\tact_this_per_equip_qty\texternal_early_start_date\texternal_late_end_date\tcreate_date\tupdate_date\tcreate_user\tupdate_user\tlocation_id');

  activities.forEach((a) => {
    const tId = activityIdToTaskIdMap.get(a.activityId)!;
    const taskWbsId = wbsIdMap.get(a.wbsId) || (wbsNodes[0] ? (wbsIdMap.get(wbsNodes[0].wbsId) || '29082') : '29082');
    const taskCalId = a.calendarId && /^\d+$/.test(a.calendarId) ? a.calendarId : defaultCalId;
    const statusCode = a.status === 'Completed' ? 'TK_Complete' : a.status === 'In Progress' ? 'TK_Active' : 'TK_NotStart';

    let taskType = 'TT_Task';
    if (a.activityType === 'Start Milestone') taskType = 'TT_StartMile';
    else if (a.activityType === 'Finish Milestone') taskType = 'TT_FinMile';
    else if (a.activityType === 'Level of Effort') taskType = 'TT_LOE';
    else if (a.activityType === 'WBS Summary') taskType = 'TT_WBS';

    const durType = taskType === 'TT_Task' ? 'DT_FixedDUR2' : 'DT_FixedDrtn';
    const pct = a.progress.activityPctComplete || 0;

    const eStart = formatP6DateTime(a.dates.earlyStart, '08:00');
    const eFinish = formatP6DateTime(a.dates.earlyFinish, '17:00');
    const lStart = formatP6DateTime(a.dates.lateStart || a.dates.earlyStart, '08:00');
    const lFinish = formatP6DateTime(a.dates.lateFinish || a.dates.earlyFinish, '17:00');
    const aStart = a.dates.actualStart ? formatP6DateTime(a.dates.actualStart, '08:00') : '';
    const aFinish = a.dates.actualFinish ? formatP6DateTime(a.dates.actualFinish, '17:00') : '';

    const planDur = a.duration.plannedDuration || 0;
    const remDur = a.duration.remainingDuration || 0;
    const actDur = a.duration.actualDuration || 0;
    const tf = a.duration.totalFloat || 0;
    const ff = a.duration.freeSlack || 0;

    lines.push(
      `%R\t${tId}\t${projId}\t${taskWbsId}\t${taskCalId}\t${pct}\tN\t1\tN\tN\tCP_Drtn\t${taskType}\t${durType}\t${statusCode}\t${cleanP6Text(a.activityId)}\t${cleanP6Text(a.name)}\t\t${tf}\t${ff}\t${remDur}\t0\t0\t0\t${planDur}\t0\t0\t0\t\t${aStart}\t${aFinish}\t${lStart}\t${lFinish}\t\t${eStart}\t${eFinish}\t\t\t${eStart}\t${eFinish}\t\t\t\tPT_Normal\t\t\t\t\t\t\t\t\tY\t0\t0\t\t\t${today} 08:00\t${today} 08:00\tadmin\tadmin\t`
    );
  });

  // 9. TASKPRED - Map successor and predecessor activity IDs to integer task IDs
  lines.push('%T\tTASKPRED');
  lines.push('%F\ttask_pred_id\ttask_id\tpred_task_id\tproj_id\tpred_proj_id\tpred_type\tlag_hr_cnt\tfloat_path\taref\tarls');

  let relCounter = 1;
  relationships.forEach((r) => {
    const succTaskId = activityIdToTaskIdMap.get(r.succActivityId);
    const predTaskId = activityIdToTaskIdMap.get(r.predActivityId);

    // Only write relationships where both activities exist
    if (!succTaskId || !predTaskId) return;

    let predType = 'PR_FS';
    if (r.type === 'SS') predType = 'PR_SS';
    else if (r.type === 'FF') predType = 'PR_FF';
    else if (r.type === 'SF') predType = 'PR_SF';

    const lag = r.lagHours || 0;
    lines.push(`%R\t${80000 + relCounter++}\t${succTaskId}\t${predTaskId}\t${projId}\t${projId}\t${predType}\t${lag}\t\t\t`);
  });

  // 10. End of file marker
  lines.push('%E');
  return lines.join('\n') + '\n';
}

export function serializeFragmentToXER(fragment: ScheduleFragment, targetProjectName = 'Fragment Import'): string {
  const dummyProject: Project = {
    id: '5265',
    shortId: 'FRAG',
    name: targetProjectName,
    startDate: new Date().toISOString().split('T')[0],
    finishDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    dataDate: new Date().toISOString().split('T')[0],
    defaultCalendarId: '7393',
  };

  const defaultCalendar: Calendar = {
    id: '7393',
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
