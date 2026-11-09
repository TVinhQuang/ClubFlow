import test from 'node:test';
import assert from 'node:assert/strict';
import {createScheduleStore,SCHEDULE_KEY} from '../src/features/schedule/store.js';
import {initialAssignments} from '../src/features/schedule/seed.js';

const memory=(initial={})=>{const map=new Map(Object.entries(initial));return {getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),map};};

test('a saved draft survives reload and keeps the seed until saved',()=>{
  const storage=memory(),store=createScheduleStore(storage,{now:()=>'2026-11-09T03:00:00Z'});
  assert.deepEqual(store.getAssignments(),initialAssignments);
  assert.equal(store.getMeta().savedAt,null);
  const moved=store.getAssignments().map(a=>a.applicationId==='HS-005'?{...a,start:'08:20'}:a);
  assert.equal(store.saveDraft({config:store.getConfig(),assignments:moved}).persisted,true);
  const reloaded=createScheduleStore(storage);
  assert.equal(reloaded.getAssignments().find(a=>a.applicationId==='HS-005').start,'08:20');
  assert.equal(reloaded.getMeta().confirmedAt,null);
});

test('confirmed schedules are read-only',()=>{
  const store=createScheduleStore(memory(),{now:()=>'2026-11-21T02:00:00Z'});
  assert.equal(store.confirm({config:store.getConfig(),assignments:store.getAssignments()}).ok,true);
  assert.equal(store.isConfirmed(),true);
  assert.equal(store.saveDraft({config:store.getConfig(),assignments:[]}).ok,false);
  assert.equal(store.confirm({config:store.getConfig(),assignments:[]}).ok,false);
});

test('corrupt data is not overwritten and failed writes are reported honestly',()=>{
  const storage=memory({[SCHEDULE_KEY]:'{broken'});
  const store=createScheduleStore(storage);
  assert.match(store.getMeta().warning,/Không đọc được/);
  assert.equal(storage.map.get(SCHEDULE_KEY),'{broken');
  const failing={getItem:()=>null,setItem:()=>{throw Error('quota');}};
  const blocked=createScheduleStore(failing);
  const result=blocked.saveDraft({config:blocked.getConfig(),assignments:blocked.getAssignments()});
  assert.equal(result.persisted,false);
  assert.match(blocked.getMeta().warning,/không lưu được/);
});
