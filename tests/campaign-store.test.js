import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignStore, STORAGE_KEY } from '../src/features/campaign/store.js';

const campaign=()=>({id:'campaign-media-2026',name:'Tuyển mới',club:'CLB Truyền thông',description:'Mô tả',instructions:'Hướng dẫn',open:'2026-11-01T08:00',close:'2026-11-20T23:00',positions:[{id:'p1',name:'Nội dung',department:'Ban Nội dung',quota:2,description:'Viết bài',requirements:'Yêu viết'}]});
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};
const options={now:()=>new Date('2026-11-07T03:00:00Z').toISOString()};

test('incomplete draft persists across reload without publishing',()=>{
  const storage=memory(),store=createCampaignStore(storage,options),input=campaign();input.name='';
  assert.equal(store.saveDraft(input).ok,true);
  const reloaded=createCampaignStore(storage,options);assert.equal(reloaded.getDraft().name,'');assert.equal(reloaded.getPublished(),null);
});
test('invalid publish retains old published snapshot and current draft',()=>{
  const store=createCampaignStore(memory(),options),input=campaign();assert.equal(store.publish(input).ok,true);
  input.name='';store.saveDraft(input);assert.equal(store.publish(input).ok,false);
  assert.equal(store.getPublished().name,'Tuyển mới');assert.equal(store.getDraft().name,'');
});
test('draft editing does not unpublish and callers cannot mutate stored snapshots',()=>{
  const store=createCampaignStore(memory(),options),input=campaign();store.publish(input);input.name='Bản sửa';store.saveDraft(input);
  assert.equal(store.getPublished().name,'Tuyển mới');assert.equal(store.getDraft().name,'Bản sửa');
  assert.equal(store.getMeta().hasUnpublishedChanges,true);
  const copy=store.getDraft();copy.positions[0].name='mutated';assert.equal(store.getDraft().positions[0].name,'Nội dung');
});
test('broken or unknown schema storage falls back safely and exposes warning',()=>{
  for(const text of ['not json',JSON.stringify({schemaVersion:77}),JSON.stringify({schemaVersion:1,draft:null})]){
    const storage=memory();storage.setItem(STORAGE_KEY,text);const store=createCampaignStore(storage,options);
    assert.ok(store.getDraft().positions.length);assert.ok(store.getMeta().warning);
  }
});
test('storage failure preserves in-memory draft and reports non-persistence',()=>{
  const store=createCampaignStore({getItem(){throw Error('blocked')},setItem(){throw Error('full')}},options);
  const input=campaign();assert.equal(store.saveDraft(input).persisted,false);assert.equal(store.getDraft().name,input.name);assert.ok(store.getMeta().warning);
});
test('a different active campaign cannot replace the published campaign',()=>{
  const store=createCampaignStore(memory(),options),input=campaign();store.publish(input);input.id='second-campaign';
  const result=store.publish(input);assert.equal(result.ok,false);assert.equal(store.getPublished().id,'campaign-media-2026');
});
test('failed durable save keeps the working-copy baseline compatible with the next page',()=>{
  const storage=memory();storage.setItem=()=>{throw Error('quota')};
  const store=createCampaignStore(storage,options);store.saveDraft(campaign());
  const baseline=store.getMeta().persistedSavedAt;
  assert.equal(store.getMeta().savedAt,'2026-11-07T03:00:00.000Z');
  assert.equal(baseline,createCampaignStore(storage,options).getMeta().persistedSavedAt);
});
