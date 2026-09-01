import fs from 'fs';
import path from 'path';
import { parseXER } from './lib/xer/parser';
import { runCPM } from './lib/cpm/calculator';
import { serializeToXER } from './lib/xer/serializer';

const xerPath = path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer');
console.log('Reading XER file from:', xerPath);

const content = fs.readFileSync(xerPath, 'utf-8');
console.log('File size:', content.length, 'characters');

const startParse = Date.now();
const parsed = parseXER(content);
const parseTime = Date.now() - startParse;

console.log(`\n--- PARSING SUMMARY (${parseTime} ms) ---`);
console.log('Project ID:', parsed.project.id);
console.log('Project Short Name:', parsed.project.shortId);
console.log('Project Name:', parsed.project.name);
console.log('Start Date:', parsed.project.startDate);
console.log('Finish Date:', parsed.project.finishDate);
console.log('Data Date:', parsed.project.dataDate);
console.log('Calendars Count:', parsed.calendars.length);
console.log('WBS Nodes Count:', parsed.wbsNodes.length);
console.log('Activities Count:', parsed.activities.length);
console.log('Relationships Count:', parsed.relationships.length);

// Sample WBS
console.log('\n--- TOP 5 WBS NODES ---');
parsed.wbsNodes.slice(0, 5).forEach(w => {
  console.log(`- [Level ${w.level}] ${w.shortCode} - ${w.name} (wbsId: ${w.wbsId}, parent: ${w.parentWbsId})`);
});

// Sample Activities
console.log('\n--- TOP 5 ACTIVITIES ---');
parsed.activities.slice(0, 5).forEach(a => {
  console.log(`- ${a.activityId}: ${a.name} | Status: ${a.status} | Dates: ${a.dates.earlyStart} to ${a.dates.earlyFinish} | Float: ${a.duration.totalFloat}h`);
});

// Run CPM
console.log('\n--- RUNNING CPM CALCULATION ---');
const startCpm = Date.now();
const cpmRes = runCPM(parsed.activities, parsed.relationships, parsed.calendars, parsed.project);
const cpmTime = Date.now() - startCpm;

console.log(`CPM completed in ${cpmTime} ms`);
console.log('Forecast Finish Date:', cpmRes.projectFinishDate);
console.log('Critical Activities Count:', cpmRes.criticalActivityIds.length);
console.log('Variance Days:', cpmRes.varianceDays);

// Test Serializer
console.log('\n--- TESTING XER SERIALIZER ---');
const startSer = Date.now();
const serialized = serializeToXER(parsed.project, parsed.calendars, parsed.wbsNodes, cpmRes.activities, parsed.relationships);
const serTime = Date.now() - startSer;
console.log(`Serialized in ${serTime} ms. Output size: ${serialized.length} chars`);
