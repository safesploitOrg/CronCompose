import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCron,parseField,compressDays,dayText,describeCron,dayRule,ALIASES} from '../../public/assets/js/cron.js';
import {formatEntry} from '../../public/assets/js/format.js';
import {extendedTrigger,isCompatible,buildExtendedCommand,COMMON_EXTENDED} from '../../public/assets/js/extended.js';
import {normalisePreferences,readPreferences,writePreferences,STORAGE_KEY} from '../../public/assets/js/preferences.js';
const valid=['* * * * *','*/15 0-23/2 1,15 * MON-FRI','59 23 31 DEC 7','0 0 * JAN-MAR SUN','0 9 * * mon,wed,fri','0 0 * * 0,6','0 0 */2 * 1-5'];
for(const expression of valid)test(`accept ${expression}`,()=>assert.equal(parseCron(expression).valid,true));
for(const expression of ['60 * * * *','* 24 * * *','* * 0 * *','* * * 0 *','* * * 13 *','* * * * 8','* * * * 5-1','*/0 * * * *','1,,2 * * * *','1/2 * * * *','* * * * MONDAY','* * * *','* * * * * *','@unknown','0 9 * * 2\n* * * * *','<script> * * * *','* * * * __proto__','0'.repeat(1000),'@reboot\n','0 0 * * 0;'])test(`reject ${JSON.stringify(expression).slice(0,90)}`,()=>assert.equal(parseCron(expression).valid,false));
for(const [alias,expression] of Object.entries(ALIASES))test(`alias ${alias}`,()=>{const m=parseCron(alias);assert.equal(m.valid,true);assert.equal(m.parts.join(' '),expression);});
test('reboot has no calendar fields',()=>{assert.equal(parseCron('@reboot').reboot,true);assert.match(describeCron(parseCron('@reboot')),/startup/);});
test('names, Sunday aliases and steps resolve to weekday sets',()=>{assert.deepEqual(parseField('MON-FRI',4),[1,2,3,4,5]);assert.deepEqual(parseField('0,7',4),[0]);assert.deepEqual(parseField('*/2',4),[0,2,4,6]);assert.deepEqual(parseField('JAN-MAR',3),[1,2,3]);});
test('all 127 non-empty weekday sets round-trip',()=>{for(let mask=1;mask<128;mask++){const days=Array.from({length:7},(_,i)=>i).filter(i=>mask&(1<<i));assert.deepEqual(parseField(compressDays(days),4),days);}});
test('weekday range and display examples',()=>{assert.equal(compressDays([1,2,3,4,5]),'1-5');assert.equal(compressDays([1,3,5]),'1,3,5');assert.equal(compressDays([0,6]),'0,6');assert.equal(dayText([1,2,3,4,5]),'Mon–Fri');assert.equal(dayText([0,6]),'Sat–Sun');assert.throws(()=>compressDays([]));});
test('all-day wildcard and restricted forms preserve different Cronie semantics',()=>{assert.equal(compressDays([0,1,2,3,4,5,6]),'*');assert.equal(compressDays([0,1,2,3,4,5,6],true),'0-6');assert.equal(dayRule(parseCron('0 9 1 * 0-6')),'OR');assert.equal(dayRule(parseCron('0 9 1 * *')),'AND');assert.equal(dayRule(parseCron('0 9 */2 * 2')),'AND');assert.match(describeCron(parseCron('0 9 1 * 2')),/OR/);});
test('native user and system output and aliases',()=>{const model=parseCron('0 9 * * 1-5');assert.equal(formatEntry({model,command:'/bin/true'}).text,'0 9 * * 1-5 /bin/true\n');assert.equal(formatEntry({model,system:true,username:'backup',command:'/bin/true',stdout:true,stderr:true}).text,'0 9 * * 1-5 backup /bin/true > /dev/null 2>&1\n');assert.equal(formatEntry({model:parseCron('@reboot'),system:true,username:'backup',command:'/bin/true'}).text,'@reboot backup /bin/true\n');});
test('comment formats and final newline',()=>{const model=parseCron('0 9 * * 2');const output=formatEntry({model,command:'/bin/true',system:true,username:'backup',comments:'detailed'});assert.match(output.text,/# \* \* \* \* \* username command_to_execute/);assert.match(output.text,/# @reboot/);assert.ok(output.text.endsWith('\n'));});
test('unsafe structural input blocks generation and native percent warns',()=>{const model=parseCron('0 9 * * 2');for(const command of ['', 'echo a\n* * * * * /bin/true','echo\0bad','x'.repeat(2049)])assert.equal(formatEntry({model,command}).text,'');assert.equal(formatEntry({model,system:true,username:'root extra',command:'/bin/true'}).text,'');assert.equal(formatEntry({model,command:'date +%F'}).warnings.length,1);assert.equal(formatEntry({model,condition:{kind:'last',day:2},command:'date +%F'}).text,'');});
test('every extended preset yields a compatible trigger and guard',()=>{for(const {kind,day} of COMMON_EXTENDED){const condition={kind,day};const model=parseCron(extendedTrigger(parseCron('15 4 3 JAN 1-5'),condition));assert.ok(isCompatible(model,condition));assert.equal(model.parts[0],'15');assert.equal(model.parts[1],'4');assert.match(buildExtendedCommand('echo OK',condition),/date \+\\%F/);assert.ok(formatEntry({model,condition,command:'echo OK'}).text);}});
test('conflicting extended input cannot be copied',()=>{const condition={kind:'last',day:2};for(const expression of ['0 9 * * 1-5','0 9 1 * 2','0 9 * JAN 2','@reboot','0 9 * * 1'])assert.equal(formatEntry({model:parseCron(expression),condition,command:'/bin/true'}).text,'');assert.throws(()=>buildExtendedCommand('echo OK',{kind:'bad',day:2}));});
test('preferences reject unknown values and never retain commands',()=>{const prefs=normalisePreferences({theme:'dark',density:'compact',layout:'other',expandedSections:['extended','bad','extended'],command:'secret',username:'root'});assert.deepEqual(prefs,{theme:'dark',density:'compact',layout:'workspace',expandedSections:['extended']});const map=new Map();const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};assert.equal(writePreferences(storage,prefs),true);assert.deepEqual(readPreferences(storage),prefs);map.set(STORAGE_KEY,'{broken');assert.equal(readPreferences(storage).theme,'system');assert.equal(writePreferences(undefined,prefs),false);});


test('weekday summary groups adjacent days in Monday-first order',()=>{
  const examples=[[[1,2,3,5],'Mon–Wed, Fri'],[[1,2,4,5],'Mon–Tue, Thu–Fri'],[[1,3,5],'Mon, Wed, Fri'],[[0,1],'Mon, Sun'],[[0,6],'Sat–Sun'],[[0,1,2,3,5,6],'Mon–Wed, Fri–Sun'],[[2],'Tue'],[[0,1,2,3,4,5,6],'Every day'],[[],'No valid weekday']];
  for(const [days,expected] of examples)assert.equal(dayText(days),expected);
});
test('all 127 weekday summaries represent exactly the selected days',()=>{
  const labels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const numbers=[1,2,3,4,5,6,0];
  for(let mask=1;mask<128;mask++){
    const selected=Array.from({length:7},(_,i)=>i).filter(i=>mask&(1<<i));
    const text=dayText(selected);
    const expanded=text==='Every day'?[...numbers]:text.split(', ').flatMap(group=>{
      const parts=group.split('–');
      assert.ok(parts.length<=2&&parts.every(part=>labels.includes(part)));
      const start=labels.indexOf(parts[0]),end=labels.indexOf(parts.at(-1));
      assert.ok(start<=end);
      return numbers.slice(start,end+1);
    });
    assert.deepEqual(expanded.sort((a,b)=>a-b),selected,text);
  }
});
test('schedule explanation and field summary use the same weekday ranges',()=>{
  const model=parseCron('0 9 * * MON-WED,FRI');
  assert.equal(dayText(model.values[4]),'Mon–Wed, Fri');
  assert.equal(describeCron(model),'At 09:00 — Mon–Wed, Fri.');
  assert.match(describeCron(parseCron('0 9 1 * 1-3,5')),/OR weekday Mon–Wed, Fri/);
  assert.equal(formatEntry({model,command:'/bin/true'}).text,'0 9 * * MON-WED,FRI /bin/true\n');
});
