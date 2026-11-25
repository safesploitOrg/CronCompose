export const FIELD_NAMES = ['Minute', 'Hour', 'Day of month', 'Month', 'Weekday'];
export const RANGES = [[0,59],[0,23],[1,31],[1,12],[0,7]];
export const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const FULL_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const ORDER = [1,2,3,4,5,6,0];
export const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
export const ALIASES = Object.freeze({'@yearly':'0 0 1 1 *','@annually':'0 0 1 1 *','@monthly':'0 0 1 * *','@weekly':'0 0 * * 0','@daily':'0 0 * * *','@midnight':'0 0 * * *','@hourly':'0 * * * *'});
export const MAX_EXPRESSION = 404;
export const MAX_FIELD = 80;
function numberFor(value, index) {
  if (/^\d{1,2}$/.test(value)) return Number(value);
  const names = index === 3 ? MONTHS : index === 4 ? DAYS.map(day => day.toUpperCase()) : [];
  const found = names.indexOf(value.toUpperCase());
  return found < 0 ? NaN : found + (index === 3 ? 1 : 0);
}
export function parseField(value, index) {
  if (typeof value !== 'string' || !value || value.length > MAX_FIELD || !RANGES[index]) return null;
  const [min,max] = RANGES[index];
  const values = new Set();
  for (const item of value.split(',')) {
    const parts = item.split('/');
    if (parts.length > 2) return null;
    const base = parts[0];
    const step = parts.length === 1 ? 1 : /^[1-9]\d?$/.test(parts[1]) ? Number(parts[1]) : 0;
    if (!step || step > max-min+1 || (parts.length === 2 && base !== '*' && !base.includes('-'))) return null;
    let a = min, b = max;
    if (base !== '*') {
      const ends = base.split('-');
      if (ends.length > 2) return null;
      a = numberFor(ends[0],index);
      b = ends.length === 2 ? numberFor(ends[1],index) : a;
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < min || b > max || a > b) return null;
    }
    for (let n = a; n <= b; n += step) values.add(index === 4 ? n % 7 : n);
  }
  return [...values].sort((a,b)=>a-b);
}
export function parseCron(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_EXPRESSION || /[\r\n\0]/.test(raw)) return {valid:false, error:'Enter a single cron expression.'};
  const text = raw.trim(), key = text.toLowerCase();
  if (key === '@reboot') return {valid:true, reboot:true, expression:key, parts:[], values:[]};
  const alias = Object.hasOwn(ALIASES,key) ? key : null;
  const parts = (alias ? ALIASES[alias] : text).split(/[ \t]+/);
  if (parts.length !== 5) return {valid:false, parts, error:'Enter five fields or a supported special string.'};
  const values = parts.map(parseField);
  const bad = values.findIndex(value=>value===null);
  if (bad !== -1) return {valid:false, parts, values, error:`Check ${FIELD_NAMES[bad].toLowerCase()}.`};
  return {valid:true, reboot:false, expression:alias || parts.join(' '), parts, values, alias};
}
export function compressDays(days, preserveRestricted = false) {
  const arr = [...new Set(days)].sort((a,b)=>a-b);
  if (!arr.length || arr.some(n=>!Number.isInteger(n)||n<0||n>6)) throw new Error('Select at least one valid weekday.');
  if (arr.length === 7) return preserveRestricted ? '0-6' : '*';
  const result = [];
  for (let i=0;i<arr.length;) {
    let j=i;
    while (j+1<arr.length && arr[j+1]===arr[j]+1) j++;
    result.push(j-i>=2 ? `${arr[i]}-${arr[j]}` : arr.slice(i,j+1).join(','));
    i=j+1;
  }
  return result.join(',');
}
export function dayText(days) {
  if (!days?.length) return 'No valid weekday';
  // Group adjacent selected days in the Monday–Sunday display order.
  const selected = ORDER.map(day => days.includes(day));
  if (selected.every(Boolean)) return 'Every day';
  const result = [];
  for (let i = 0; i < ORDER.length;) {
    if (!selected[i]) { i++; continue; }
    let end = i;
    while (end + 1 < ORDER.length && selected[end + 1]) end++;
    result.push(end === i ? DAYS[ORDER[i]] : `${DAYS[ORDER[i]]}–${DAYS[ORDER[end]]}`);
    i = end + 1;
  }
  return result.length ? result.join(', ') : 'No valid weekday';
}
export function dayRule(model) {
  // Cronie distinguishes wildcard-led day fields from restricted fields.
  if (!model.valid || model.reboot) return '';
  const [,,dom,,dow] = model.parts;
  return !dom.startsWith('*') && !dow.startsWith('*') ? 'OR' : 'AND';
}
export function describeCron(model) {
  if (!model.valid) return model.error;
  if (model.reboot) return 'At cron daemon startup.';
  const [min,hour,dom,month,dow] = model.parts;
  const known = {'* * * * *':'Every minute.','0 * * * *':'At the start of every hour.','0 0 * * *':'Every day at midnight.','0 0 1 * *':'At midnight on the first day of each month.','0 0 1 1 *':'At midnight on 1 January.','0 0 * * 0':'At midnight every Sunday.'};
  const key = model.parts.join(' ');
  if (Object.hasOwn(known,key)) return known[key];
  if (/^\*\/[1-9]\d?$/.test(min) && model.parts.slice(1).every(v=>v==='*')) return `Every ${min.slice(2)} minutes within each hour.`;
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom==='*' && month==='*') return `At ${hour.padStart(2,'0')}:${min.padStart(2,'0')} — ${dayText(model.values[4])}.`;
  const date = dayRule(model)==='OR' ? `Day of month ${dom} OR weekday ${dayText(model.values[4])}` : `Day of month ${dom}; weekday ${dayText(model.values[4])}`;
  return `Minute ${min}; hour ${hour}; ${date}; month ${month}.`;
}
