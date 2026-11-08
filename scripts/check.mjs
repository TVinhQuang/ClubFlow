import {readFile,readdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pages} from './generate.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const page of pages){
  const html=await readFile(path.join(root,page.file),'utf8');
  assert.equal([...html.matchAll(/<h1\b/g)].length,1,`${page.file}: one h1`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`${page.file}: duplicate IDs`);
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const target=match[1].split('#')[0];if(target.startsWith('data:')||target.startsWith('http'))continue;assert.ok((await stat(path.join(root,target))).isFile(),`${page.file}: ${target}`);}
  for(const match of html.matchAll(/<label[^>]+for="([^"]+)"/g))assert.ok(ids.includes(match[1]),`${page.file}: label ${match[1]}`);
  assert.ok(!html.includes('\uFFFD'),`${page.file}: encoding`);
}
for(const name of await readdir(path.join(root,'src/styles'))){const css=await readFile(path.join(root,'src/styles',name),'utf8');assert.ok(!css.includes('!important'),`${name}: no important`);assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,`${name}: braces`);}
console.log('Checked 7 pages: local references, single h1, unique IDs, labels and CSS structure.');
