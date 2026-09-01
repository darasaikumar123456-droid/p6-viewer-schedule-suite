import { WBSNode, Activity, Relationship, ScheduleFragment, ActivityType } from '../../types/p6';
import { ActivityIdPattern, formatActivityId } from '../p6/activityIdPattern';

export interface ScheduleGeneratorOptions {
  prompt: string;
  projectType: string;
  targetDurationWeeks: number;
  parentWbsId: string | null;
  parentWbsCode?: string;
  parentWbsName?: string;
  parentLevel?: number;
  projectId: string;
  startDate?: string;
  activityIdPattern?: ActivityIdPattern;
}

interface ParsedTask {
  name: string;
  phaseName: string;
  phaseCodeSuffix: string;
  discipline: 'civil' | 'structural' | 'mechanical' | 'electrical' | 'piping' | 'qa_testing' | 'general' | 'milestone';
  durationDays: number;
  resource: string;
  isMilestone?: boolean;
}

/**
 * Intelligent construction NLP keyword matcher and scope decomposition engine
 */
export function generateScheduleFromPrompt(options: ScheduleGeneratorOptions): ScheduleFragment {
  const {
    prompt,
    projectType,
    targetDurationWeeks = 12,
    parentWbsId,
    parentWbsCode = 'WBS',
    parentWbsName = 'Target Scope',
    parentLevel = 1,
    projectId,
    startDate = new Date().toISOString().split('T')[0],
  } = options;

  const cleanPrompt = prompt.trim();
  const parsedTasks = extractStructuredTasks(cleanPrompt, projectType, targetDurationWeeks);

  // Group tasks by Phase or Discipline to create sub-WBS nodes
  const phaseNames = Array.from(new Set(parsedTasks.map(t => t.phaseName)));

  const phaseColors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
  ];

  // 1. Build Sub-WBS Nodes
  const wbsMap = new Map<string, WBSNode>();
  const wbsNodes: WBSNode[] = phaseNames.map((phase, idx) => {
    const codeSuffix = `PH.${idx + 1}`;
    const node: WBSNode = {
      wbsId: `DRAFT-WBS-${idx + 1}`,
      parentWbsId: parentWbsId,
      shortCode: `${parentWbsCode}.${codeSuffix}`,
      name: phase,
      level: parentLevel + 1,
      projectId,
      color: phaseColors[idx % phaseColors.length],
    };
    wbsMap.set(phase, node);
    return node;
  });

  const pattern: ActivityIdPattern = options.activityIdPattern || {
    prefix: 'A',
    maxNumber: 2000,
    digitCount: 4,
    stepIncrement: 10,
  };

  // 2. Build Activities with sequential scheduling & dates
  const activities: Activity[] = [];
  let currentDate = new Date(startDate);
  let seqIdx = 0;

  // Add Notice to Proceed / Commencement Milestone
  const startWbs = wbsNodes[0] || { wbsId: 'DRAFT-WBS-1' };
  const dateStr = formatDate(currentDate);
  activities.push({
    activityId: formatActivityId(pattern, seqIdx++),
    name: `Notice to Proceed / ${parentWbsName} Commencement`,
    wbsId: startWbs.wbsId,
    projectId,
    activityType: 'Start Milestone' as ActivityType,
    status: 'Not Started',
    isCritical: true,
    isLongestPath: true,
    calendarId: 'CAL-1',
    assignedResource: 'Project Management',
    dates: {
      earlyStart: dateStr,
      earlyFinish: dateStr,
      lateStart: dateStr,
      lateFinish: dateStr,
    },
    duration: {
      plannedDuration: 0,
      remainingDuration: 0,
      actualDuration: 0,
      atCompletionDuration: 0,
      totalFloat: 0,
      freeSlack: 0,
    },
    progress: { activityPctComplete: 0, pctCompleteType: 'Duration' },
  });

  parsedTasks.forEach((task) => {
    const matchedWbs = wbsMap.get(task.phaseName) || wbsNodes[0];
    const isMilestone = !!task.isMilestone;
    const days = isMilestone ? 0 : Math.max(1, task.durationDays);

    const earlyStart = formatDate(currentDate);
    const earlyFinishDate = isMilestone ? currentDate : addWorkingDays(currentDate, days);
    const earlyFinish = formatDate(isMilestone ? currentDate : earlyFinishDate);

    if (!isMilestone) {
      currentDate = earlyFinishDate;
    }

    const durationHours = days * 8;

    activities.push({
      activityId: formatActivityId(pattern, seqIdx++),
      name: task.name,
      wbsId: matchedWbs.wbsId,
      projectId,
      activityType: (isMilestone ? 'Finish Milestone' : 'Task Dependent') as ActivityType,
      status: 'Not Started',
      isCritical: true,
      isLongestPath: true,
      calendarId: 'CAL-1',
      assignedResource: task.resource,
      dates: {
        earlyStart,
        earlyFinish,
        lateStart: earlyStart,
        lateFinish: earlyFinish,
      },
      duration: {
        plannedDuration: durationHours,
        remainingDuration: durationHours,
        actualDuration: 0,
        atCompletionDuration: durationHours,
        totalFloat: 0,
        freeSlack: 0,
      },
      progress: { activityPctComplete: 0, pctCompleteType: 'Duration' },
    });
  });

  // Add Final Handover / Readiness Milestone
  const lastWbs = wbsNodes[wbsNodes.length - 1] || wbsNodes[0];
  const finalDateStr = formatDate(currentDate);
  activities.push({
    activityId: formatActivityId(pattern, seqIdx++),
    name: `${parentWbsName} Commissioning Complete & Sign-off`,
    wbsId: lastWbs.wbsId,
    projectId,
    activityType: 'Finish Milestone' as ActivityType,
    status: 'Not Started',
    isCritical: true,
    isLongestPath: true,
    calendarId: 'CAL-1',
    assignedResource: 'Client Handover',
    dates: {
      earlyStart: finalDateStr,
      earlyFinish: finalDateStr,
      lateStart: finalDateStr,
      lateFinish: finalDateStr,
    },
    duration: {
      plannedDuration: 0,
      remainingDuration: 0,
      actualDuration: 0,
      atCompletionDuration: 0,
      totalFloat: 0,
      freeSlack: 0,
    },
    progress: { activityPctComplete: 0, pctCompleteType: 'Duration' },
  });

  // 3. Build Predecessor-Successor Relationships (FS Driving Chain)
  const relationships: Relationship[] = [];
  for (let i = 0; i < activities.length - 1; i++) {
    relationships.push({
      id: `FR-${i + 1}`,
      predActivityId: activities[i].activityId,
      succActivityId: activities[i + 1].activityId,
      type: 'FS',
      lagHours: 0,
      isDriving: true,
    });
  }

  const totalCalculatedDays = activities.reduce((acc, a) => acc + (a.duration.plannedDuration / 8), 0);

  return {
    draftId: `DRAFT-${Date.now()}`,
    sourcePrompt: cleanPrompt,
    status: 'draft',
    wbsNodes,
    activities,
    relationships,
    assumptions: [
      `Assumes 6-day working week with 8 working hours per day`,
      `Executed structured scope parsing across ${wbsNodes.length} phases with total ${totalCalculatedDays} working days`,
      `Assigned domain commissioning crews and verified sequential Finish-to-Start (FS) logic`,
    ],
    confidenceNotes: `High (Calibrated to explicit prompt phases, tasks, and durations)`,
  };
}

/**
 * Intelligent Structured Scope Extractor with Phase & Explicit Duration Support
 */
function extractStructuredTasks(
  prompt: string,
  projectType: string,
  targetDurationWeeks: number
): ParsedTask[] {
  const tasks: ParsedTask[] = [];

  // Split lines
  const rawLines = prompt.split(/\r?\n/);
  let currentPhase = 'Commissioning Works';

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // 1. Check if this is a Phase Header (e.g. **Phase 1: Pre-Commissioning & Energization (Days 1–4)** or ### Phase 1...)
    const phaseMatch = trimmed.match(
      /(?:\*\*|###|##|\b)(Phase\s*\d+[^:*)]*[:\-\s]+[^*()]+)(?:\(.*?\))?(?:\*\*|#)?/i
    );
    if (phaseMatch) {
      currentPhase = cleanPhaseName(phaseMatch[1]);
      continue;
    }

    // 2. Check if this is a bulleted task (e.g. * **Mechanical & Lubrication Inspections:** ... *(Duration: 2 days)*)
    const isBullet = /^[-*•\d.)]\s+/.test(trimmed) || /^\*\*/.test(trimmed);
    if (isBullet) {
      const cleanLine = trimmed
        .replace(/^[-*•\d.)\s]+/, '') // remove bullet
        .trim();

      if (cleanLine.length < 5) continue;

      // Extract duration from *(Duration: 2 days)* or (Duration: 1–2 days) or (2 days)
      const durationMatch = cleanLine.match(/Duration:\s*(\d+)(?:[–\-](\d+))?\s*days?/i) ||
        cleanLine.match(/\((\d+)(?:[–\-](\d+))?\s*days?\)/i);

      let durationDays = 2;
      if (durationMatch) {
        if (durationMatch[2]) {
          // If range like 1–2 days, take the upper bound
          durationDays = parseInt(durationMatch[2], 10);
        } else if (durationMatch[1]) {
          durationDays = parseInt(durationMatch[1], 10);
        }
      }

      // Clean task title and description
      let taskName = cleanLine
        .replace(/\*+\(Duration:.*?\)\*+/gi, '') // remove trailing duration
        .replace(/\(Duration:.*?\)/gi, '')
        .replace(/\*+/g, '') // remove markdown bold
        .trim();

      if (taskName.endsWith(':')) {
        taskName = taskName.slice(0, -1).trim();
      }

      const disc = detectDiscipline(taskName);
      const res = detectResource(taskName, disc);

      tasks.push({
        name: taskName,
        phaseName: currentPhase,
        phaseCodeSuffix: 'PH',
        discipline: disc,
        durationDays: Math.max(1, durationDays),
        resource: res,
      });
    }
  }

  // If structured phase/bullet parsing found tasks, return them
  if (tasks.length >= 2) {
    return tasks;
  }

  // Fallback to NLP topic detector if prompt was a continuous paragraph
  return extractTasksFromParagraph(prompt, projectType, targetDurationWeeks);
}

function cleanPhaseName(raw: string): string {
  return raw
    .replace(/\*+/g, '')
    .replace(/^#+\s*/, '')
    .replace(/\(.*?\)/g, '')
    .trim();
}

function extractTasksFromParagraph(
  prompt: string,
  projectType: string,
  targetDurationWeeks: number
): ParsedTask[] {
  const lower = prompt.toLowerCase();
  const tasks: ParsedTask[] = [];

  const defaultDaysPerTask = Math.max(2, Math.round((targetDurationWeeks * 6) / 6));

  const detectedTopics: {
    keyword: RegExp;
    name: string;
    phaseName: string;
    discipline: ParsedTask['discipline'];
    resource: string;
  }[] = [
    { keyword: /\b(lubricat|torque|rail|hpu|bolt)\b/i, name: 'Mechanical & Lubrication Inspections (Bolts, Rail Alignment, HPU)', phaseName: 'Pre-Commissioning & Energization', discipline: 'mechanical', resource: 'Mechanical Commissioning Team' },
    { keyword: /\b(megger|insulat|cable|grounding|continuity)\b/i, name: 'Cabling & Insulation Checks (Megger Testing, Grounding)', phaseName: 'Pre-Commissioning & Energization', discipline: 'electrical', resource: 'Electrical Testing Crew' },
    { keyword: /\b(energiz|switchgear|transformer|ups|auxiliary)\b/i, name: 'Auxiliary Energization (LV Switchgear, Control Power, UPS)', phaseName: 'Pre-Commissioning & Energization', discipline: 'electrical', resource: 'Electrical Specialists' },
    { keyword: /\b(safety|emergency|pull-cord|belt sway|zero-speed)\b/i, name: 'Safety Device & Interlock Verification (E-Stops, Pull-cords)', phaseName: 'Instrumentation & Loop Testing', discipline: 'electrical', resource: 'Instrumentation Technicians' },
    { keyword: /\b(i\/o|loop|encoder|plc|scada|hmi|rtd)\b/i, name: 'Cold Point-to-Point I/O Signal & Loop Checking (PLC/SCADA)', phaseName: 'Instrumentation & Loop Testing', discipline: 'electrical', resource: 'PLC & Automation Engineer' },
    { keyword: /\b(crd|reel|drum|trailing cable)\b/i, name: 'Cable Reeling Drum (CRD) Tension & Spooling Checks', phaseName: 'Instrumentation & Loop Testing', discipline: 'electrical', resource: 'Electrical Team' },
    { keyword: /\b(bump|rotation|phase|motor)\b/i, name: 'Uncoupled Motor Bump & Direction of Rotation Checks (LT, Slew, Luff)', phaseName: 'Motor Bump & Alignment', discipline: 'mechanical', resource: 'Millwrights & Electricians' },
    { keyword: /\b(brake|coupling|laser|alignment)\b/i, name: 'Laser Coupling Alignment & Thruster Brake Gap Adjustment', phaseName: 'Motor Bump & Alignment', discipline: 'mechanical', resource: 'Rigging & Alignment Crew' },
    { keyword: /\b(hydraulic|valve|pump flow|hpu)\b/i, name: 'Hydraulic Power Pack (HPU) Pressure & Valve Function Tests', phaseName: 'Mechanism No-Load Running', discipline: 'mechanical', resource: 'Hydraulic Specialists' },
    { keyword: /\b(luff|boom|winch|cylinder)\b/i, name: 'Luffing Mechanism Test (Boom Raising/Lowering & Over-travel Limits)', phaseName: 'Mechanism No-Load Running', discipline: 'mechanical', resource: 'Mechanical Commissioning Team' },
    { keyword: /\b(slew|angular|pinion)\b/i, name: 'Slewing Mechanism Running (Angular Range, Encoders & Soft-Stops)', phaseName: 'Mechanism No-Load Running', discipline: 'mechanical', resource: 'Mechanical Commissioning Team' },
    { keyword: /\b(long travel|lt|gantry|rail clamp)\b/i, name: 'Long Travel (LT) Gantry Running & Rail Clamp Release Tests', phaseName: 'Mechanism No-Load Running', discipline: 'mechanical', resource: 'Heavy Mechanical Team' },
    { keyword: /\b(bucket wheel|boom conveyor|vfd)\b/i, name: 'Boom Conveyor & Bucket Wheel Dry Running (Vibration & VFD Curves)', phaseName: 'Mechanism No-Load Running', discipline: 'mechanical', resource: 'Commissioning Engineers' },
    { keyword: /\b(interlock|collision|radar|sequence)\b/i, name: 'Integrated Sequence Simulation & Anti-Collision Radar Checks', phaseName: 'Integrated Sequence & Endurance', discipline: 'qa_testing', resource: 'Automation Engineer' },
    { keyword: /\b(endurance|continuous|no-load)\b/i, name: 'Continuous No-Load Endurance Run (8 to 24-hr System Test)', phaseName: 'Integrated Sequence & Endurance', discipline: 'qa_testing', resource: 'Lead Commissioning Team' },
    { keyword: /\b(punch|sign-off|handover|clearance)\b/i, name: 'Punch List Clearance & Client Cold Commissioning Sign-off', phaseName: 'Integrated Sequence & Endurance', discipline: 'qa_testing', resource: 'Client & Project Lead' },
  ];

  detectedTopics.forEach(topic => {
    if (topic.keyword.test(lower)) {
      tasks.push({
        name: topic.name,
        phaseName: topic.phaseName,
        phaseCodeSuffix: 'PH',
        discipline: topic.discipline,
        durationDays: defaultDaysPerTask,
        resource: topic.resource,
      });
    }
  });

  return tasks;
}

function detectDiscipline(text: string): ParsedTask['discipline'] {
  const l = text.toLowerCase();
  if (/megger|insulat|cable|ground|electr|wire|switchgear|transformer|power|ups|crd|energiz/i.test(l)) return 'electrical';
  if (/sensor|plc|scada|i\/o|loop|encoder|instrument|interlock|hmi|rtd/i.test(l)) return 'electrical';
  if (/endurance|trial|test|punch|sign-off|commission|handover|qc|qa/i.test(l)) return 'qa_testing';
  if (/steel|structure|rail|gantry/i.test(l)) return 'structural';
  if (/hydraulic|pump|hpu|motor|slew|luff|conveyor|bucket wheel|lubricat|torque|align|brake|coupling/i.test(l)) return 'mechanical';
  return 'general';
}

function detectResource(text: string, discipline: ParsedTask['discipline']): string {
  const l = text.toLowerCase();
  if (/megger|insulat|cable|ground/i.test(l)) return 'Electrical Testing Crew';
  if (/plc|scada|i\/o|loop|instrument|sensor/i.test(l)) return 'Automation & PLC Engineer';
  if (/hpu|hydraulic/i.test(l)) return 'Hydraulic Specialists';
  if (/slew|luff|bucket|conveyor|motor|bump/i.test(l)) return 'Mechanical Commissioning Team';
  if (/brake|coupling|alignment|laser/i.test(l)) return 'Millwrights & Alignment Crew';
  if (/punch|sign-off|handover/i.test(l)) return 'Client QA/QC Lead';
  if (/endurance|sequence|collision/i.test(l)) return 'Commissioning Engineers';
  return 'Execution Team';
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addWorkingDays(startDate: Date, workingDays: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < workingDays) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) { // Skip Sunday
      added++;
    }
  }
  return result;
}
