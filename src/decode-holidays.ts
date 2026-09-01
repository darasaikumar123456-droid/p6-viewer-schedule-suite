import fs from 'fs';
import path from 'path';

// Function to convert P6 / Delphi serial day number to YYYY-MM-DD
export function p6SerialToDate(serial: number): string {
  // P6 / Delphi epoch: day 1 is 1899-12-31, day 0 is 1899-12-30
  // Note: JavaScript Date treats epoch 1970-01-01. The difference between 1899-12-30 and 1970-01-01 is 25569 days.
  const msPerDay = 86400000;
  const epochDiffDays = 25569;
  const jsTimestamp = (serial - epochDiffDays) * msPerDay;
  const d = new Date(jsTimestamp);
  return d.toISOString().split('T')[0];
}

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

      const rawData = row['clndr_data'] || '';
      const exceptionsBlock = rawData.substring(rawData.indexOf('Exceptions'));
      const dayMatches = [...rawData.matchAll(/\(d\|(\d+)\)/g)].map(m => parseInt(m[1]));

      console.log(`\n=== CALENDAR ${row['clndr_name']} (ID: ${row['clndr_id']}) HOLIDAYS COUNT: ${dayMatches.length} ===`);
      const holidayDates = dayMatches.map(serial => ({
        serial,
        date: p6SerialToDate(serial),
      }));

      console.log('Project Scope Holidays (2024 to 2028):');
      holidayDates
        .filter(h => h.date >= '2024-01-01' && h.date <= '2028-12-31')
        .forEach(h => console.log(`- Serial ${h.serial} -> ${h.date}`));
    } else if (l.startsWith('%T')) {
      inCal = false;
      break;
    }
  }
}
