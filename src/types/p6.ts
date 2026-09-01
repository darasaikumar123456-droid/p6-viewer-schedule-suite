export type ActivityType =
  | 'Task Dependent'
  | 'Start Milestone'
  | 'Finish Milestone'
  | 'Level of Effort'
  | 'WBS Summary'
  | 'Resource Dependent';

export type ActivityStatus = 'Not Started' | 'In Progress' | 'Completed';

export type RelationshipType = 'FS' | 'SS' | 'FF' | 'SF';

export type DurationUnit = 'h' | 'd' | 'w' | 'm';

export type TimeScaleUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface Calendar {
  id: string;
  name: string;
  workHoursPerDay: number; // e.g. 8.0
  workDaysPerWeek: number; // e.g. 5 or 6
  daysPerMonth: number;    // e.g. 20 or 26
  holidays?: string[];     // YYYY-MM-DD
}

export interface Project {
  id: string;
  shortId: string;         // e.g. "PR" or "ST-01"
  name: string;
  startDate: string;       // YYYY-MM-DD
  finishDate: string;      // YYYY-MM-DD
  dataDate: string;        // YYYY-MM-DD
  defaultCalendarId: string;
  revisionNumber?: number;
  activityCount?: number;
}

export interface WBSNode {
  wbsId: string;
  parentWbsId: string | null;
  shortCode: string;
  name: string;
  level: number;
  projectId: string;
  color?: string;
  expanded?: boolean;
}

export interface ActivityDates {
  earlyStart: string;
  earlyFinish: string;
  lateStart: string;
  lateFinish: string;
  actualStart?: string | null;
  actualFinish?: string | null;
  expectedFinish?: string | null;
  remainingLateStart?: string | null;
}

export interface ActivityDuration {
  plannedDuration: number;    // stored in hours
  remainingDuration: number;  // in hours
  actualDuration: number;     // in hours
  atCompletionDuration: number; // in hours
  totalFloat: number;         // in hours (CPM computed or P6 parsed)
  freeSlack: number;          // in hours
}

export interface ActivityProgress {
  activityPctComplete: number; // 0 - 100
  physicalPctComplete?: number;
  unitsPctComplete?: number;
  pctCompleteType: 'Duration' | 'Physical' | 'Units';
}

export interface ActivityWork {
  actualLaborUnits?: number;
  atCompletionUnits?: number;
  plannedLaborUnits?: number;
}

export interface Relationship {
  id: string;
  predActivityId: string;
  succActivityId: string;
  type: RelationshipType;
  lagHours: number;           // in hours
  isDriving: boolean;
}

export interface ActivityCodeAssignment {
  codeType: string;
  codeValue: string;
  activityId: string;
}

export interface Activity {
  activityId: string;         // e.g. "A1240"
  name: string;
  wbsId: string;
  projectId: string;
  activityType: ActivityType;
  status: ActivityStatus;
  isCritical: boolean;
  isLongestPath: boolean;
  constraintType?: string;
  constraintDate?: string;
  calendarId: string;
  assignedResource?: string;
  
  dates: ActivityDates;
  duration: ActivityDuration;
  progress: ActivityProgress;
  work?: ActivityWork;
  codes?: Record<string, string>;
}

export interface BaselineRevision {
  projectId: string;
  revisionNumber: number;
  name: string;
  uploadedAt: string;
  sourceFile: string;
  activitiesSnapshot: Record<string, {
    startDate: string;
    finishDate: string;
    durationDays: number;
  }>;
}

export interface ColumnDefinition {
  id: string;
  category: 'Activity Codes' | 'Dates' | 'Durations' | 'General' | 'Lists' | 'Percent Complete' | 'Work';
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  visible: boolean;
  order: number;
}

export interface BarSetting {
  id: string;
  label: string;
  visible: boolean;
  color: string;
  shape: 'bar' | 'diamond' | 'bracket';
  isDefault?: boolean;
}

export interface WBSPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface FilterState {
  startDate?: string;
  endDate?: string;
  statuses: ActivityStatus[];
  isCriticalOnly?: boolean;
  selectedWbsIds: string[];
  activityCodes: Record<string, string[]>;
  hideIfEmpty: boolean;
}

export interface GroupRule {
  id: string;
  groupBy: 'WBS' | 'Status' | 'Activity Type' | 'Resource' | 'Calendar';
  indent: boolean;
  toLevel: number;
  groupInterval?: string;
}

export interface ScheduleFragment {
  draftId: string;
  sourcePrompt: string;
  status: 'draft' | 'confirmed' | 'exported';
  wbsNodes: WBSNode[];
  activities: Activity[];
  relationships: Relationship[];
  assumptions: string[];
  confidenceNotes: string;
}
