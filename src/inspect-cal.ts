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
    console.log('CALENDAR TABLE FOUND:');
    continue;
  }
  if (inCal) {
    if (l.startsWith('%F\t') || l.startsWith('%F ')) {
      fields = l.substring(3).split('\t');
      console.log('FIELDS:', fields);
    } else if (l.startsWith('%R\t') || l.startsWith('%R ')) {
      const values = l.substring(3).split('\t');
      const row: Record<string, string> = {};
      fields.forEach((f, idx) => {
        row[f] = values[idx];
      });
      console.log('CALENDAR ROW:', {
        clndr_id: row['clndr_id'],
        clndr_name: row['clndr_name'],
        clndr_type: row['clndr_type'],
        day_hr_cnt: row['day_hr_cnt'],
        week_hr_cnt: row['week_hr_cnt'],
        month_hr_cnt: row['month_hr_cnt'],
        year_hr_cnt: row['year_hr_cnt'],
        clndr_data: row['clndr_data'] ? row['clndr_data'].substring(0, 100) + '...' : '',
      });
    } else if (l.startsWith('%T')) {
      inCal = false;
      break;
    }
  }
}
