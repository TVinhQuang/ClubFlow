import {cp,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {generate,pages} from './generate.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
await generate();await mkdir(path.join(root,'dist'),{recursive:true});
for(const name of ['src','assets',...pages.map(p=>p.file)])await cp(path.join(root,name),path.join(root,'dist',name),{recursive:true});
console.log('Static build ready in dist/. No dependencies or network required.');
