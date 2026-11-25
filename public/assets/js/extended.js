import {FULL_DAYS, parseCron, parseField} from './cron.js';
export const OCCURRENCES = ['first','second','third','fourth','last','lastDay'];
export const COMMON_EXTENDED = Object.freeze([
  {label:'First Monday',kind:'first',day:1},
  {label:'Second Tuesday',kind:'second',day:2},
  {label:'Last Tuesday',kind:'last',day:2},
  {label:'Last Friday',kind:'last',day:5},
  {label:'Last day',kind:'lastDay',day:2}
]);
export function validateExtended(condition) {
  return !!condition && OCCURRENCES.includes(condition.kind) && Number.isInteger(condition.day) && condition.day>=0 && condition.day<=6;
}
export function extendedLabel(condition) {
  if (!validateExtended(condition)) throw new Error('Invalid extended schedule.');
  const {kind,day}=condition;
  return kind==='lastDay' ? 'Last day of each month' : `${kind[0].toUpperCase()+kind.slice(1)} ${FULL_DAYS[day]} of each month`;
}
export function extendedTrigger(model, condition) {
  if (!validateExtended(condition)) throw new Error('Invalid extended schedule.');
  const parts = model?.parts || [];
  // Preserve valid time fields even if other fields are being edited.
  const minute = parseField(parts[0],0) ? parts[0] : '0';
  const hour = parseField(parts[1],1) ? parts[1] : '9';
  return `${minute} ${hour} * * ${condition.kind==='lastDay'?'*':condition.day}`;
}
export function isCompatible(model, condition) {
  if (!validateExtended(condition) || !model.valid || model.reboot || model.alias) return false;
  const [,,dom,month,dow]=model.parts;
  return dom==='*' && month==='*' && (condition.kind==='lastDay'?dow==='*':model.values[4].length===1&&model.values[4][0]===condition.day);
}
export function quoteShell(command) {
  return "'"+command.replace(/'/g,"'\\''")+"'";
}
export function buildExtendedCommand(command, condition, redirect='') {
  if (!validateExtended(condition)) throw new Error('Invalid extended schedule.');
  if (typeof command!=='string'||!command.trim()||command.length>2048||/[\r\n\0%]/.test(command)) throw new Error('Extended commands require a single line without percent signs; use a separate script otherwise.');
  if (!['',' > /dev/null',' 2>/dev/null',' > /dev/null 2>&1'].includes(redirect)) throw new Error('Invalid redirection.');
  // A single local date snapshot avoids a midnight race. UTC calendar arithmetic
  // avoids DST transitions in the look-ahead. Cron and the local date must use the same timezone.
  // Backslash-percent is required by cron, even inside shell quotes.
  const invoke = `/bin/sh -c ${quoteShell(command)}${redirect}`;
  const snapshot = String.raw`d=$(date +\%F)`;
  if (condition.kind==='last'||condition.kind==='lastDay') {
    const days=condition.kind==='last'?7:1;
    return snapshot+String.raw` && n=$(TZ=UTC0 date -d "$d +`+days+String.raw` days" +\%Y-\%m) && case "$d" in "$n"-*) ;; *) `+invoke+' ;; esac';
  }
  const n=OCCURRENCES.indexOf(condition.kind);
  return snapshot+' && day=${d##*-} && if [ "$day" -ge '+(n*7+1)+' ] && [ "$day" -le '+(n*7+7)+' ]; then '+invoke+'; fi';
}
export function describeExtended(model, condition) {
  const label=extendedLabel(condition);
  if (!isCompatible(model,condition)) return 'Expression conflicts with extended scheduling.';
  const [minute,hour]=model.parts;
  return /^\d+$/.test(minute)&&/^\d+$/.test(hour) ? `At ${hour.padStart(2,'0')}:${minute.padStart(2,'0')} — ${label}.` : `${label}; minute ${minute}, hour ${hour}.`;
}
export function parseExtendedTrigger(expression, condition) {return isCompatible(parseCron(expression),condition);}
