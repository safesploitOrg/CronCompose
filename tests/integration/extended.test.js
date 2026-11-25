import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,chmodSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildExtendedCommand,COMMON_EXTENDED,OCCURRENCES,extendedTrigger} from '../../public/assets/js/extended.js';
import {parseCron} from '../../public/assets/js/cron.js';
const gnu=spawnSync('date',['--version'],{encoding:'utf8'});
assert.equal(gnu.status,0,'GNU date is required for integration tests');
assert.match(gnu.stdout,/GNU coreutils/);
const dir=mkdtempSync(join(tmpdir(),'croncompose-test-'));
const shim=join(dir,'date');
// Only the current date is frozen; all look-ahead arithmetic uses real GNU date.
writeFileSync(shim,`#!/bin/sh\nif [ "$1" = '+%F' ]; then\n  [ "\${TEST_DATE_FAIL:-0}" != 1 ] || exit 19\n  printf '%s\\n' "$TEST_DATE"\nelse\n  exec /usr/bin/date "$@"\nfi\n`);
chmodSync(shim,0o700);
process.on('exit',()=>rmSync(dir,{recursive:true,force:true}));
function run(command,date,{fail=false,real=false}={}){
  // Model the relevant cron pre-processing for generated commands: escaped % becomes literal %.
  // All percent signs in the generated guard are escaped; user percent signs are rejected.
  assert.doesNotMatch(command,/(?<!\\)%/);
  const shell=command.replace(/\\%/g,'%');
  return spawnSync('/bin/sh',['-c',shell],{encoding:'utf8',timeout:5000,env:{...process.env,PATH:real?'/usr/bin:/bin':`${dir}:/usr/bin:/bin`,TZ:'UTC0',TEST_DATE:date,TEST_DATE_FAIL:fail?'1':'0'}});
}
const months=[[2023,1],[2024,1],[2024,2],[2025,2],[2026,3],[2026,4],[2026,11],[2026,12]];
function monthDates(year,month){const count=new Date(Date.UTC(year,month,0)).getUTCDate();return Array.from({length:count},(_,i)=>new Date(Date.UTC(year,month-1,i+1)));}
function expectedDates(dates,kind,day){if(kind==='lastDay')return [dates.at(-1)];const hits=dates.filter(d=>d.getUTCDay()===day);return [kind==='last'?hits.at(-1):hits[['first','second','third','fourth'].indexOf(kind)]];}
function iso(d){return d.toISOString().slice(0,10);}
const cases=COMMON_EXTENDED.map(({label,kind,day})=>({label,kind,day}));
for(const kind of OCCURRENCES.filter(k=>k!=='lastDay'))for(let day=0;day<7;day++)if(!cases.some(c=>c.kind===kind&&c.day===day))cases.push({label:`${kind} weekday ${day}`,kind,day});
for(const {label,kind,day} of cases)test(`shell calendar: ${label}`,()=>{
  const condition={kind,day};const model=parseCron(extendedTrigger(parseCron('0 9 * * *'),condition));
  const command=buildExtendedCommand('echo EXECUTED',condition);
  for(const [year,month] of months){
    const dates=monthDates(year,month), expected=expectedDates(dates,kind,day).map(iso), actual=[];
    for(const date of dates){
      if(!model.values[4].includes(date.getUTCDay()))continue;
      const result=run(command,iso(date));
      assert.equal(result.status,0,`${label} ${iso(date)} ${result.stderr}`);
      if(result.stdout.trim()==='EXECUTED')actual.push(iso(date));else assert.equal(result.stdout,'');
    }
    assert.deepEqual(actual,expected,`${label} ${year}-${month}`);
  }
});
test('shell quoting, stdout/stderr redirection and command status',()=>{
  const condition={kind:'last',day:2};
  const input=`echo "it's working"; echo 'stderr line' >&2; exit 7`;
  for(const [redirect,out,err] of [['',"it's working\n",'stderr line\n'],[' > /dev/null','','stderr line\n'],[' 2>/dev/null',"it's working\n",''],[' > /dev/null 2>&1','','']]){
    const result=run(buildExtendedCommand(input,condition,redirect),'2026-11-24');assert.equal(result.status,7);assert.equal(result.stdout,out);assert.equal(result.stderr,err);
  }
  const skipped=run(buildExtendedCommand(input,condition),'2026-11-17');assert.equal(skipped.status,0);assert.equal(skipped.stdout,'');assert.equal(skipped.stderr,'');
});
test('date failure fails closed',()=>{const result=run(buildExtendedCommand('echo EXECUTED',{kind:'last',day:2}),'2026-11-24',{fail:true});assert.equal(result.status,19);assert.equal(result.stdout,'');});
test('real current GNU date snapshot, no fixture',()=>{const now=new Date();const end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,0)).getUTCDate();const result=run(buildExtendedCommand('echo EXECUTED',{kind:'lastDay',day:2}),iso(now),{real:true});assert.equal(result.status,0);assert.equal(result.stdout,now.getUTCDate()===end?'EXECUTED\n':'');});
