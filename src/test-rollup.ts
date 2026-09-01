import fs from 'fs';
import path from 'path';
import { parseXER } from './lib/xer/parser';
import { WBSNode, Activity } from './types/p6';

const xerContent = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const parsed = parseXER(xerContent);

console.log('Total WBS Nodes:', parsed.wbsNodes.length);
console.log('Total Activities:', parsed.activities.length);

// Build parent-to-children WBS mapping
const wbsChildrenMap = new Map<string, string[]>();
parsed.wbsNodes.forEach(w => {
  if (w.parentWbsId) {
    if (!wbsChildrenMap.has(w.parentWbsId)) wbsChildrenMap.set(w.parentWbsId, []);
    wbsChildrenMap.get(w.parentWbsId)!.push(w.wbsId);
  }
});

// Build descendant WBS map
const getDescendantWbsIds = (wbsId: string): Set<string> => {
  const result = new Set<string>([wbsId]);
  const stack = [wbsId];
  while (stack.length > 0) {
    const curr = stack.pop()!;
    const children = wbsChildrenMap.get(curr) || [];
    for (const ch of children) {
      if (!result.has(ch)) {
        result.add(ch);
        stack.push(ch);
      }
    }
  }
  return result;
};

// Map activities to WBS
const activitiesByWbsId = new Map<string, Activity[]>();
parsed.activities.forEach(a => {
  if (!activitiesByWbsId.has(a.wbsId)) activitiesByWbsId.set(a.wbsId, []);
  activitiesByWbsId.get(a.wbsId)!.push(a);
});

// Compute rollups for top 5 WBS nodes
parsed.wbsNodes.slice(0, 8).forEach(node => {
  const allDescendantWbs = getDescendantWbsIds(node.wbsId);
  const allActs: Activity[] = [];
  allDescendantWbs.forEach(wId => {
    const acts = activitiesByWbsId.get(wId) || [];
    allActs.push(...acts);
  });

  let minStart = '9999-99-99';
  let maxFinish = '0000-00-00';
  let minFloat = 999999;
  let totalPlannedHrs = 0;
  let totalActHrs = 0;
  let totalRemHrs = 0;

  allActs.forEach(a => {
    const s = a.dates.actualStart || a.dates.earlyStart;
    const f = a.dates.actualFinish || a.dates.earlyFinish;
    if (s && s < minStart) minStart = s;
    if (f && f > maxFinish) maxFinish = f;
    if (a.duration.totalFloat < minFloat) minFloat = a.duration.totalFloat;
    totalPlannedHrs += a.duration.plannedDuration || 0;
    totalActHrs += a.duration.actualDuration || 0;
    totalRemHrs += a.duration.remainingDuration || 0;
  });

  const totalAtComp = totalActHrs + totalRemHrs;
  const pctComplete = totalAtComp > 0 ? Math.round((totalActHrs / totalAtComp) * 100) : 0;

  console.log(`\n[WBS Level ${node.level}] ${node.shortCode} - ${node.name}:`);
  console.log(`  Activities: ${allActs.length}`);
  console.log(`  Start: ${minStart === '9999-99-99' ? '-' : minStart} | Finish: ${maxFinish === '0000-00-00' ? '-' : maxFinish}`);
  console.log(`  Planned: ${(totalPlannedHrs / 8).toFixed(1)}d | Rem: ${(totalRemHrs / 8).toFixed(1)}d | Float: ${minFloat === 999999 ? '-' : (minFloat / 8).toFixed(1) + 'd'}`);
  console.log(`  % Complete: ${pctComplete}%`);
});
