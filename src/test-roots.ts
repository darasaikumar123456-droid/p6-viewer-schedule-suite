import fs from 'fs';
import path from 'path';
import { parseXER } from './lib/xer/parser';

const content = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const parsed = parseXER(content);

console.log('Total WBS Nodes:', parsed.wbsNodes.length);

const wbsIdSet = new Set(parsed.wbsNodes.map(w => w.wbsId));

// Check parent IDs
const invalidParents = parsed.wbsNodes.filter(w => w.parentWbsId && !wbsIdSet.has(w.parentWbsId));
console.log('WBS Nodes whose parent is NOT in the XER:', invalidParents.map(w => ({
  wbsId: w.wbsId,
  name: w.name,
  parentWbsId: w.parentWbsId,
})));

// Root nodes with current logic vs fixed logic
const oldRoots = parsed.wbsNodes.filter(w => !w.parentWbsId);
const fixedRoots = parsed.wbsNodes.filter(w => !w.parentWbsId || !wbsIdSet.has(w.parentWbsId));

console.log(`Old Roots count: ${oldRoots.length}`);
console.log(`Fixed Roots count: ${fixedRoots.length}`);
fixedRoots.forEach(r => console.log(`- Root: ${r.shortCode} - ${r.name} (wbsId: ${r.wbsId}, parent: ${r.parentWbsId})`));
