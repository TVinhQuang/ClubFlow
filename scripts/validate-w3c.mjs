import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {pages} from './generate.mjs';

// Explicitly uploads generated prototype HTML to the public W3C Nu service.
// Run only when the team has authorized that destination for the current source.
const endpoint='https://validator.w3.org/nu/?out=json';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'checks/w3c');
await mkdir(output,{recursive:true});
const results=[];
for(const {file,view} of pages){
  const html=await readFile(path.join(root,file));
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/html; charset=utf-8','User-Agent':'ClubFlow-PA2-HTML-Validation/1.0'},body:html,signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error(`${file}: W3C returned HTTP ${response.status}`);
  const raw=await response.text(),report=JSON.parse(raw);
  if(!Array.isArray(report.messages))throw Error(`${file}: invalid W3C response`);
  const errors=report.messages.filter(message=>message.type==='error');
  const warnings=report.messages.filter(message=>message.subType==='warning');
  const result={file,view,sha256:createHash('sha256').update(html).digest('hex'),errors:errors.length,warnings:warnings.length,report:`${view}.json`};
  await writeFile(path.join(output,result.report),raw.trimEnd()+'\n','utf8');
  results.push(result);
  console.log(`${file}: ${result.errors} errors, ${result.warnings} warnings`);
  for(const message of report.messages)if(message.type==='error'||message.subType==='warning')console.log(`  ${message.type}${message.subType?`/${message.subType}`:''} line ${message.lastLine??'?'}: ${message.message}`);
}
const summary={checkedAt:new Date().toISOString(),endpoint,scope:'Generated static HTML files only (sample data). Validation does not certify JavaScript-rendered states, responsive layout, or external CSS.',results};
await writeFile(path.join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n','utf8');
if(results.some(result=>result.errors>0))process.exitCode=1;
