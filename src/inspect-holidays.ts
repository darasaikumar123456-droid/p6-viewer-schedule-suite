import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.resolve('e:/P6 Viewer/Aditya- Smelter-31.10.25.xer'), 'utf-8');
const lines = content.split(/\r?\n/);

let inCal = false;
let fields: string[] = [];

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith('%T\tCALENDAR') || l.startsWith('%T CALENDAR')) {
    inCal = true;
    continue;
  }
  if (inCal) {
    if (l.startsWith('%F\t') || l.startsWith('%F ')) {
      fields = l.substring(3).split('\t');
    } else if (l.startsWith('%R\t') || l.startsWith('%R ')) {
      const values = l.substring(3).split('\t');
      const row: Record<string, string> = {};
      fields.forEach((f, idx) => {
        row[f] = values[idx];
      });
      console.log(`\n=== CALENDAR ID ${row['clndr_id']} (${row['clndr_name']}) ===`);
      const rawData = row['clndr_data'] || '';
      console.log('Total clndr_data length:', rawData.length);
      console.log('Raw clndr_data:\n', rawData);

      // Search for holidays or exception patterns in clndr_data
      const exceptionMatches = rawData.match(/\(\d+\|\|[^\)]*\)/g);
      console.log('\nMatches in clndr_data:', exceptionMatches);
    } else if (l.startsWith('%T')) {
      inCal = false;
      break;
    }
  }
}
