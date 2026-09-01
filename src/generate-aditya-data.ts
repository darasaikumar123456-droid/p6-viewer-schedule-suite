import fs from 'fs';
import path from 'path';
import { parseXER } from './lib/xer/parser';

const xerContent = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const parsed = parseXER(xerContent);

console.log('Generating adityaData.ts...');
const outPath = path.resolve('e:/P6 Viewer/src/data/adityaData.ts');

const fileContent = `// Auto-generated production dataset from Aditya- Smelter-31.10.25.xer
import { Project, WBSNode, Activity, Relationship, Calendar } from '../types/p6';

export const adityaProject: Project = ${JSON.stringify(parsed.project, null, 2)};
export const adityaCalendars: Calendar[] = ${JSON.stringify(parsed.calendars, null, 2)};
export const adityaWbsNodes: WBSNode[] = ${JSON.stringify(parsed.wbsNodes, null, 2)};
export const adityaActivities: Activity[] = ${JSON.stringify(parsed.activities, null, 2)};
export const adityaRelationships: Relationship[] = ${JSON.stringify(parsed.relationships, null, 2)};
`;

fs.writeFileSync(outPath, fileContent, 'utf-8');
console.log('adityaData.ts generated successfully! File size:', (fileContent.length / 1024 / 1024).toFixed(2), 'MB');
