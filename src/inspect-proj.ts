import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const lines = content.split(/\r?\n/);

let inProj = false;
let inWbs = false;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith('%T\tPROJECT') || l.startsWith('%T PROJECT')) {
    inProj = true;
    console.log('PROJECT TABLE:');
    console.log(lines[i]);
    console.log(lines[i+1]);
    console.log(lines[i+2]);
  }
}
