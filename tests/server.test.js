import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../scripts/dev.mjs';
test('local server exposes the app and fonts while blocking hidden repository paths',async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    for(const file of ['/','/applications.html','/schedule.html','/results.html','/apply.html','/my-applications.html','/interviews.html','/login.html','/src/app.js','/assets/fonts/inter-latin.woff2'])assert.equal((await fetch(base+file)).status,200,file);
    assert.equal((await fetch(base+'/.git/config')).status,403);
    assert.equal((await fetch(base+'/AGENTS.md')).status,404);
    assert.equal((await fetch(base+'/%2e%2e%5c.git/config')).status,403);
    assert.equal((await fetch(base+'/missing.html')).status,404);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
