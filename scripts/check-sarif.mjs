import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
// Fail closed: any CodeQL finding is blocking for this small project.
const folder=process.argv[2];assert.ok(folder,'SARIF directory required');
const files=readdirSync(folder).filter(f=>f.endsWith('.sarif'));assert.ok(files.length,'No SARIF results produced');
let runs=0,findings=0;
for(const file of files){const data=JSON.parse(readFileSync(join(folder,file),'utf8'));assert.ok(Array.isArray(data.runs)&&data.runs.length,'Invalid SARIF');for(const run of data.runs){runs++;assert.ok(Array.isArray(run.results),'Missing results');assert.ok(!run.invocations?.some(i=>i.executionSuccessful===false),'CodeQL execution failed');for(const result of run.results){findings++;console.error(`${file}: ${result.ruleId||'unknown rule'}`);}}}
console.log(`CodeQL: ${runs} run(s), ${findings} finding(s)`);if(findings)process.exitCode=1;
