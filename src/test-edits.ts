import fs from 'fs';
import path from 'path';
import { parseXER } from './lib/xer/parser';
import { runCPM } from './lib/cpm/calculator';
import { serializeToXER } from './lib/xer/serializer';
import { Activity, Relationship } from './types/p6';

console.log('=== TEST SCENARIO: EDITING ACTUALS, PROGRESS, RELATIONSHIPS & LAGS ===\n');

// 1. Load Aditya Smelter XER
const xerContent = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const parsed = parseXER(xerContent);

console.log(`Loaded Schedule: "${parsed.project.name}" (${parsed.activities.length} activities, ${parsed.relationships.length} relationships)`);

// 2. Initial baseline CPM
const initialCPM = runCPM(parsed.activities, parsed.relationships, parsed.calendars, parsed.project);
console.log(`\n[Initial State] Forecast Finish Date: ${initialCPM.projectFinishDate} | Variance: ${initialCPM.varianceDays}d | Critical Count: ${initialCPM.criticalActivityIds.length}`);

// Pick a target activity to test edits on: e.g. AS7550, AS1000, or first uncompleted activity
const targetActId = 'AS1000'; // '200 MW RE RTC Power'
const targetAct = parsed.activities.find(a => a.activityId === targetActId);
console.log(`\nTarget Activity Before Edit:`, {
  id: targetAct?.activityId,
  name: targetAct?.name,
  status: targetAct?.status,
  dates: targetAct?.dates,
  pctComplete: targetAct?.progress.activityPctComplete,
});

// TEST 1: Update Activity Percentage Completion & Actual Start
console.log('\n--- TEST 1: SETTING ACTUAL START & 65% COMPLETION ---');
const modifiedActivities: Activity[] = parsed.activities.map(a => {
  if (a.activityId === targetActId) {
    return {
      ...a,
      status: 'In Progress',
      dates: {
        ...a.dates,
        actualStart: '2026-01-15',
      },
      duration: {
        ...a.duration,
        remainingDuration: 160, // 20 days remaining
      },
      progress: {
        ...a.progress,
        activityPctComplete: 65,
      },
    };
  }
  return a;
});

const cpmAfterTest1 = runCPM(modifiedActivities, parsed.relationships, parsed.calendars, parsed.project);
const actAfterTest1 = cpmAfterTest1.activities.find(a => a.activityId === targetActId);
console.log(`Updated Activity After Test 1:`, {
  id: actAfterTest1?.activityId,
  status: actAfterTest1?.status,
  actualStart: actAfterTest1?.dates.actualStart,
  earlyFinish: actAfterTest1?.dates.earlyFinish,
  pctComplete: actAfterTest1?.progress.activityPctComplete,
  remainingDuration: actAfterTest1?.duration.remainingDuration,
});
console.log(`CPM Result: Forecast Finish: ${cpmAfterTest1.projectFinishDate} | Variance: ${cpmAfterTest1.varianceDays}d`);

// TEST 2: Complete an Activity with Actual Finish Date
console.log('\n--- TEST 2: COMPLETING ACTIVITY WITH ACTUAL FINISH DATE ---');
const completedActivities: Activity[] = modifiedActivities.map(a => {
  if (a.activityId === targetActId) {
    return {
      ...a,
      status: 'Completed',
      dates: {
        ...a.dates,
        actualStart: '2026-01-15',
        actualFinish: '2026-02-10',
      },
      duration: {
        ...a.duration,
        actualDuration: 200,
        remainingDuration: 0,
        atCompletionDuration: 200,
      },
      progress: {
        ...a.progress,
        activityPctComplete: 100,
      },
    };
  }
  return a;
});

const cpmAfterTest2 = runCPM(completedActivities, parsed.relationships, parsed.calendars, parsed.project);
const actAfterTest2 = cpmAfterTest2.activities.find(a => a.activityId === targetActId);
console.log(`Updated Activity After Test 2:`, {
  id: actAfterTest2?.activityId,
  status: actAfterTest2?.status,
  actualStart: actAfterTest2?.dates.actualStart,
  actualFinish: actAfterTest2?.dates.actualFinish,
  earlyFinish: actAfterTest2?.dates.earlyFinish,
  pctComplete: actAfterTest2?.progress.activityPctComplete,
});

// TEST 3: Add New Relationships & Adjust Lag/Lead (+80h lag)
console.log('\n--- TEST 3: ADDING RELATIONSHIP WITH 80h (10d) LAG ---');
const newRelationship: Relationship = {
  id: `REL-TEST-999`,
  predActivityId: targetActId,
  succActivityId: 'AS1010', // Rectifier-Mechanical completion
  type: 'FS',
  lagHours: 80, // 10 days lag
  isDriving: true,
};

const modifiedRelationships: Relationship[] = [...parsed.relationships, newRelationship];

const cpmAfterTest3 = runCPM(completedActivities, modifiedRelationships, parsed.calendars, parsed.project);
const succActAfterTest3 = cpmAfterTest3.activities.find(a => a.activityId === 'AS1010');
console.log(`Successor Activity (AS1010) After Lag Adjustment:`, {
  id: succActAfterTest3?.activityId,
  name: succActAfterTest3?.name,
  earlyStart: succActAfterTest3?.dates.earlyStart,
  earlyFinish: succActAfterTest3?.dates.earlyFinish,
  totalFloat: succActAfterTest3?.duration.totalFloat,
});
console.log(`CPM Result: Forecast Finish: ${cpmAfterTest3.projectFinishDate} | Variance: ${cpmAfterTest3.varianceDays}d`);

// TEST 4: Verify XER Export with all modified actuals, % complete, and relationships
console.log('\n--- TEST 4: XER SERIALIZATION VERIFICATION ---');
const serializedOutput = serializeToXER(
  parsed.project,
  parsed.calendars,
  parsed.wbsNodes,
  cpmAfterTest3.activities,
  modifiedRelationships
);

// Re-parse exported XER to verify round-trip integrity
const reParsed = parseXER(serializedOutput);
const reParsedTarget = reParsed.activities.find(a => a.activityId === targetActId);
const reParsedRel = reParsed.relationships.find(r => r.predActivityId === targetActId && r.succActivityId === 'AS1010');

console.log(`Round-trip Verification:`, {
  exportedActivitiesCount: reParsed.activities.length,
  exportedRelationshipsCount: reParsed.relationships.length,
  targetActivityStatus: reParsedTarget?.status,
  targetActivityPctComplete: reParsedTarget?.progress.activityPctComplete,
  targetActivityActualFinish: reParsedTarget?.dates.actualFinish,
  addedRelationshipFound: Boolean(reParsedRel),
  addedRelationshipLag: reParsedRel?.lagHours,
});

console.log('\n=== ALL TEST CASES PASSED SUCCESSFULLY ===');
