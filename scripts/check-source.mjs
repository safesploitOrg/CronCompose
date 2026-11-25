import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
function walk(path){return readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(path,e.name)):[join(path,e.name)]);}
for(const file of [...walk('public'),...walk('tests'),...walk('scripts')].filter(f=>/\.(m?js)$/.test(f))){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});assert.equal(result.status,0,file);}
const html=readFileSync('public/index.html','utf8');
assert.match(html,/<!DOCTYPE html>/i);assert.match(html,/Content-Security-Policy/);assert.match(html,/connect-src 'none'/);
assert.doesNotMatch(html,/<script\b(?![^>]*\bsrc=)[^>]*>/i);assert.doesNotMatch(html,/\s(?:on\w+|style)\s*=/i);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate ID');
for(const match of html.matchAll(/\b(?:for|aria-describedby)="([^"]+)"/g))assert.ok(ids.includes(match[1]),`Missing target ${match[1]}`);
for(const match of html.matchAll(/\b(?:src|href)="(assets\/[^"#]+)"/g))assert.ok(existsSync(join('public',match[1])),`Missing asset ${match[1]}`);
assert.equal((html.match(/https:\/\/github\.com\/safesploitOrg\/CronCompose/g)||[]).length,1);assert.match(html,/<footer>[\s\S]*https:\/\/github\.com\/safesploitOrg\/CronCompose[\s\S]*<\/footer>/);
for(const file of walk('public/assets/js').filter(f=>f.endsWith('.js'))){const code=readFileSync(file,'utf8');assert.doesNotMatch(code,/\b(?:innerHTML|outerHTML|insertAdjacentHTML|eval)\s*(?:=|\()/,`Unsafe DOM/code evaluation in ${file}`);assert.doesNotMatch(code,/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/,`Unexpected network access in ${file}`);}
assert.equal(readFileSync('public/CNAME','utf8').trim(),'cron.git.safesploit.com');
console.log('JavaScript syntax, HTML structure, local assets, footer, CSP and focused safety checks passed.');
