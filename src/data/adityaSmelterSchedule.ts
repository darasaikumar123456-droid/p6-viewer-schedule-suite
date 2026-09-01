import { parseXER, ParsedSchedule } from '../lib/xer/parser';

// Pre-parsed Aditya Smelter data generator
export function getAdityaSmelterSchedule(rawXerText?: string): ParsedSchedule | null {
  if (!rawXerText) return null;
  return parseXER(rawXerText);
}
