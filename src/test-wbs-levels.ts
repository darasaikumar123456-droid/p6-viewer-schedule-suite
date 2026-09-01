import fs from 'fs';
import path from 'path';
import { parseXER } from './lib/xer/parser';

const xerContent = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const parsed = parseXER(xerContent);

console.log('Total WBS Nodes:', parsed.wbsNodes.length);

const roots = parsed.wbsNodes.filter(w => !w.parentWbsId);
console.log('L1 Roots:', roots.map(r => `${r.wbsId}: ${r.shortCode} - ${r.name}`));

roots.forEach(r => {
  const l2Children = parsed.wbsNodes.filter(w => w.parentWbsId === r.wbsId);
  console.log(`L2 Children of ${r.shortCode} (${l2Children.length}):`, l2Children.map(c => `${c.shortCode} - ${c.name}`));

  l2Children.slice(0, 3).forEach(l2 => {
    const l3Children = parsed.wbsNodes.filter(w => w.parentWbsId === l2.wbsId);
    console.log(`  L3 Children of ${l2.shortCode} (${l3Children.length}):`, l3Children.slice(0, 5).map(c => `${c.shortCode} - ${c.name}`));
  });
});
