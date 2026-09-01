import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const lines = content.split(/\r?\n/);

let inTask = false;
let inPred = false;
let taskFields: string[] = [];
let predFields: string[] = [];

const taskMap = new Map<string, { task_id: string; task_code: string; task_name: string }>();
const rawPreds: any[] = [];

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith('%T\tTASK') && !l.startsWith('%T\tTASKPRED') && !l.startsWith('%T\tTASKACTV')) {
    inTask = true;
    inPred = false;
    continue;
  }
  if (l.startsWith('%T\tTASKPRED')) {
    inTask = false;
    inPred = true;
    continue;
  }
  if (l.startsWith('%T') && !l.startsWith('%T\tTASK')) {
    inTask = false;
    inPred = false;
  }

  if (inTask) {
    if (l.startsWith('%F\t')) {
      taskFields = l.substring(3).split('\t');
    } else if (l.startsWith('%R\t')) {
      const vals = l.substring(3).split('\t');
      const row: any = {};
      taskFields.forEach((f, idx) => { row[f] = vals[idx]; });
      taskMap.set(row['task_id'], {
        task_id: row['task_id'],
        task_code: row['task_code'],
        task_name: row['task_name'],
      });
    }
  }

  if (inPred) {
    if (l.startsWith('%F\t')) {
      predFields = l.substring(3).split('\t');
      console.log('TASKPRED FIELDS:', predFields);
    } else if (l.startsWith('%R\t')) {
      const vals = l.substring(3).split('\t');
      const row: any = {};
      predFields.forEach((f, idx) => { row[f] = vals[idx]; });
      rawPreds.push(row);
    }
  }
}

console.log(`Total Tasks parsed: ${taskMap.size}`);
console.log(`Total Preds parsed: ${rawPreds.length}`);

console.log('\nSample 5 TASKPRED rows:');
rawPreds.slice(0, 5).forEach((p, idx) => {
  const predTask = taskMap.get(p['pred_task_id']);
  const succTask = taskMap.get(p['task_id']);
  console.log(`[${idx+1}] pred_task_id: ${p['pred_task_id']} (${predTask?.task_code}) -> task_id: ${p['task_id']} (${succTask?.task_code}) | type: ${p['pred_type']} | lag: ${p['lag_hr_cnt']}`);
});

// Check activity 'AS1050' relationships
const as1050Task = [...taskMap.values()].find(t => t.task_code === 'AS1050');
console.log('\nAS1050 Task:', as1050Task);

if (as1050Task) {
  const predsForAS1050 = rawPreds.filter(p => p['task_id'] === as1050Task.task_id);
  const succsForAS1050 = rawPreds.filter(p => p['pred_task_id'] === as1050Task.task_id);
  console.log(`Preds for AS1050 (${as1050Task.task_id}):`, predsForAS1050.map(p => ({
    pred_task_id: p['pred_task_id'],
    pred_code: taskMap.get(p['pred_task_id'])?.task_code,
    pred_name: taskMap.get(p['pred_task_id'])?.task_name,
    type: p['pred_type'],
  })));
  console.log(`Succs for AS1050 (${as1050Task.task_id}):`, succsForAS1050.map(p => ({
    succ_task_id: p['task_id'],
    succ_code: taskMap.get(p['task_id'])?.task_code,
    succ_name: taskMap.get(p['pred_task_id'])?.task_name,
    type: p['pred_type'],
  })));
}
