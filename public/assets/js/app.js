import {parseCron,dayText,compressDays,describeCron,dayRule} from './cron.js';
import {COMMON_EXTENDED,validateExtended,extendedLabel,extendedTrigger,isCompatible,describeExtended} from './extended.js';
import {formatEntry} from './format.js';
import {readPreferences,writePreferences,SECTIONS} from './preferences.js';
const $ = id => document.getElementById(id);
const fields=Array.from({length:5},(_,i)=>$('f'+i));
const days=Array.from(document.querySelectorAll('[data-day]'));
const regular=Array.from(document.querySelectorAll('[data-expr]'));
const details=SECTIONS.map($);
let system=false,condition=null,priorExpression=null,model=parseCron($('expression').value);
let storage;
try{storage=window.localStorage;}catch{storage=undefined;}
let preferences=readPreferences(storage);
function applyPreferences(){
  document.documentElement.dataset.theme=preferences.theme;
  document.documentElement.dataset.density=preferences.density;
  $('theme').value=preferences.theme;$('density').value=preferences.density;
  details.forEach(el=>{el.open=preferences.expandedSections.includes(el.id);});
}
function savePreferences(){
  preferences={theme:$('theme').value,density:$('density').value,layout:'workspace',expandedSections:details.filter(el=>el.open).map(el=>el.id)};
  document.documentElement.dataset.theme=preferences.theme;document.documentElement.dataset.density=preferences.density;
  writePreferences(storage,preferences);
}
function initialisePresets(){
  COMMON_EXTENDED.forEach(({label,kind,day})=>{
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.dataset.kind=kind;button.dataset.dow=String(day);
    button.addEventListener('click',()=>enableExtended(kind,day));$('extended-presets').append(button);
  });
}
function enableExtended(kind,day){
  if(kind==='none'){removeExtended();return;}
  const next={kind,day:Number(day)};
  if(!validateExtended(next))return;
  if(!condition)priorExpression=$('expression').value;
  condition=next;
  $('extended').open=true;$('occurrence').value=kind;$('extended-day').value=String(day);
  $('expression').value=extendedTrigger(model,condition);
  render(true);
}
function removeExtended(restore=true){
  if(condition&&restore&&priorExpression!==null)$('expression').value=priorExpression;
  condition=null;priorExpression=null;$('occurrence').value='none';render(true);
}
function render(sync){
  model=parseCron($('expression').value);
  const extended=Boolean(condition),compatible=!extended||isCompatible(model,condition),valid=model.valid&&compatible;
  const hasParts=model.parts?.length===5&&!model.reboot;
  fields.forEach((field,i)=>{
    if(sync)field.value=hasParts?model.parts[i]:'';
    field.disabled=Boolean(model.reboot)||extended&&i>=2;
    field.setAttribute('aria-invalid',String(hasParts&&model.values?.[i]===null));
  });
  $('expression').readOnly=extended;
  $('expression-label').textContent=extended?'Cron trigger (generated)':'Cron expression';
  $('expression').setAttribute('aria-invalid',String(!valid));
  $('weekday-panel').hidden=extended||Boolean(model.reboot);
  $('extended-lock').hidden=!extended;
  const selected=hasParts&&model.values?.[4]||[];
  days.forEach(button=>{
    const active=selected.includes(Number(button.dataset.day));
    button.classList.toggle('on',active);button.setAttribute('aria-pressed',String(active));
    button.disabled=extended||!hasParts||!model.values?.[4];
  });
  $('days-label').textContent=dayText(selected);
  $('day-hint').textContent='Click a day to include or exclude it.';
  $('syntax-status').textContent=valid?'✓ Supported syntax':'Check expression';
  $('syntax-status').classList.toggle('error',!valid);
  $('meaning').textContent=!model.valid?model.error:extended?describeExtended(model,condition):describeCron(model);
  let detail=model.reboot?'No fixed calendar execution time.':model.alias?`Equivalent: ${model.parts.join(' ')}`:'Uses the target cron host’s timezone.';
  if(extended)detail=condition.kind==='lastDay'?'Daily cron trigger; a shell condition checks for month end.':'Weekly cron trigger; a shell condition checks the monthly occurrence.';
  else if(dayRule(model)==='OR')detail+=' Either restricted day field can trigger the job.';
  $('schedule-detail').textContent=detail;
  $('guard-info').hidden=!extended;$('ext-status').textContent=extended?'Enabled':'Optional';
  $('extended-day-field').hidden=condition?.kind==='lastDay';
  $('extended-day').disabled=condition?.kind==='lastDay';
  $('guard-desc').textContent=extended?`${extendedLabel(condition)}. Requires GNU date and /bin/sh.`:'';
  $('copy-expression').textContent=extended?'Copy trigger only':'Copy expression';
  $('copy-expression').disabled=!valid;
  regular.forEach(b=>{const active=!extended&&model.valid&&b.dataset.expr===model.expression;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll('[data-kind]').forEach(b=>{const active=extended&&b.dataset.kind===condition.kind&&(condition.kind==='lastDay'||Number(b.dataset.dow)===condition.day);b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  renderOutput();
}
function changeWeekday(day){
  if(condition||!model.parts||!model.values?.[4])return;
  const next=new Set(model.values[4]);
  if(next.has(day))next.delete(day);else next.add(day);
  if(!next.size){$('day-hint').textContent='Keep at least one weekday selected.';return;}
  const parts=[...model.parts];
  // Preserve explicitly restricted day-of-week semantics when the day-of-month is restricted.
  const restricted=!parts[2].startsWith('*')&&!parts[4].startsWith('*');
  parts[4]=compressDays([...next],restricted);
  $('expression').value=parts.join(' ');render(true);
}
function renderOutput(){
  const comments=$('comments').value;
  const result=formatEntry({model,condition,system,username:$('username').value,command:$('command').value,stdout:$('stdout').checked,stderr:$('stderr').checked,comments});
  $('output').value=result.text;
  $('output').rows=comments==='detailed'?18:comments==='simple'?11:condition?5:3;
  $('copy').disabled=!result.text;
  $('output-warnings').textContent=[...result.errors,...result.warnings].join(' ');
  $('output-warnings').classList.toggle('error',result.errors.length>0);
  $('copy-state').textContent='Preview only · commands never run here';
}
function setMode(next){
  system=next;$('user-field').hidden=!system;
  $('user-mode').classList.toggle('selected',!system);$('system-mode').classList.toggle('selected',system);
  $('user-mode').setAttribute('aria-pressed',String(!system));$('system-mode').setAttribute('aria-pressed',String(system));
  $('install-label').textContent=system?'Example system crontab file:':'Install in your own user’s crontab:';
  $('install-command').textContent=system?'sudoedit /etc/cron.d/example':'crontab -e';renderOutput();
}
async function copyText(value,target){
  if(!value)return;
  try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(value);$('copy-state').textContent='Copied to clipboard.';}
  catch{target.focus();target.select();$('copy-state').textContent='Selected — press Ctrl+C or Cmd+C.';}
}
function initialise(){
  applyPreferences();initialisePresets();
  details.forEach(el=>el.addEventListener('toggle',savePreferences));
  $('theme').addEventListener('change',savePreferences);$('density').addEventListener('change',savePreferences);
  $('expression').addEventListener('input',()=>{if(!condition)render(true);});
  fields.forEach((field,i)=>field.addEventListener('input',()=>{
    if(condition&&i>=2)return;
    $('expression').value=fields.map(f=>f.value.trim()).join(' ');render(false);
  }));
  days.forEach(b=>b.addEventListener('click',()=>changeWeekday(Number(b.dataset.day))));
  regular.forEach(b=>b.addEventListener('click',()=>{condition=null;priorExpression=null;$('occurrence').value='none';$('expression').value=b.dataset.expr;render(true);}));
  $('occurrence').addEventListener('change',()=>enableExtended($('occurrence').value,$('extended-day').value));
  $('extended-day').addEventListener('change',()=>{if(condition&&condition.kind!=='lastDay')enableExtended(condition.kind,$('extended-day').value);});
  $('guard-remove').addEventListener('click',()=>removeExtended());
  $('user-mode').addEventListener('click',()=>setMode(false));$('system-mode').addEventListener('click',()=>setMode(true));
  ['username','command','stdout','stderr','comments'].forEach(id=>$(id).addEventListener('input',renderOutput));
  $('copy').addEventListener('click',()=>copyText($('output').value,$('output')));
  $('copy-expression').addEventListener('click',()=>copyText(model.expression,$('expression')));
  $('current-year').textContent=String(new Date().getFullYear());render(true);
}
initialise();
