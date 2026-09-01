import fs from 'fs';
import path from 'path';
import { parseXER } from './lib/xer/parser';

const xerContent = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const parsed = parseXER(xerContent);

console.log('Total activities parsed:', parsed.activities.length);
console.log('Total relationships parsed:', parsed.relationships.length);

const targetCode = 'AS11341.9';
const targetAct = parsed.activities.find(a => a.activityId === targetCode || a.name.includes('Pot shell C25-C30'));
console.log('\nTarget Activity found in parsed.activities:', targetAct);

// Check relationships for this activity
const preds = parsed.relationships.filter(r => r.succActivityId === targetAct?.activityId);
const succs = parsed.relationships.filter(r => r.predActivityId === targetAct?.activityId);

console.log('\nRelationships matching parsed targetAct.activityId:');
console.log('Predecessors:', preds);
console.log('Successors:', succs);

// Now let's inspect the raw tables for this activity
const rawTasks = parsed.rawTables?.['TASK'] || [];
const rawPreds = parsed.rawTables?.['TASKPRED'] || [];

const matchingRawTask = rawTasks.find(t => t['task_code'] === targetCode || t['task_name']?.includes('Pot shell C25-C30'));
console.log('\nMatching Raw Task from TASK table:', matchingRawTask);

if (matchingRawTask) {
  const taskId = matchingRawTask['task_id'];
  console.log(`Raw task_id = "${taskId}" for task_code = "${matchingRawTask['task_code']}"`);

  const rawPredsForTask = rawPreds.filter(p => p['task_id'] === taskId);
  const rawSuccsForTask = rawPreds.filter(p => p['pred_task_id'] === taskId);

  console.log(`Raw Predecessors in TASKPRED (where task_id === "${taskId}"):`, rawPredsForTask);
  console.log(`Raw Successors in TASKPRED (where pred_task_id === "${taskId}"):`, rawSuccsForTask);
}
