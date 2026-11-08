import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCampaign, normalizeCampaign, canRemovePosition, getIntakeStatus } from '../src/features/campaign/model.js';

export const validCampaign = () => ({id:'campaign-media-2026',name:'Tuyển thành viên',club:'CLB Truyền thông',description:'Kết nối những người cùng đam mê.',instructions:'Gửi CV PDF và chia sẻ nguyện vọng.',open:'2026-11-01T08:00',close:'2026-11-20T23:00',positions:[{id:'position-content',department:'Ban Nội dung',name:'Sáng tạo nội dung',quota:8,description:'Viết bài và lên ý tưởng.',requirements:'Có trách nhiệm và yêu viết.'}]});

test('complete campaign can publish; input is not mutated by normalization',()=>{
  const input=validCampaign();input.name='  Tuyển thành viên  ';
  const normalized=normalizeCampaign(input);
  assert.equal(normalized.name,'Tuyển thành viên');assert.equal(input.name,'  Tuyển thành viên  ');
  assert.deepEqual(validateCampaign(input),[]);
});
test('publish targets empty required fields, invalid dates and missing positions',()=>{
  const input=validCampaign();input.name='  ';input.close='2026-02-30T09:00';input.positions=[];
  const fields=validateCampaign(input).map(e=>e.field);
  assert.ok(fields.includes('name'));assert.ok(fields.includes('close'));assert.ok(fields.includes('positions'));
});
test('closing must be after opening, including time on the same day',()=>{
  const input=validCampaign();input.close=input.open;
  assert.ok(validateCampaign(input).some(e=>e.field==='close'));
  input.close='2026-11-01T08:01';assert.deepEqual(validateCampaign(input),[]);
});
test('every position needs department, name, positive integer quota and descriptions',()=>{
  const input=validCampaign();Object.assign(input.positions[0],{department:' ',name:' ',quota:1.5,description:' ',requirements:' '});
  const fields=validateCampaign(input).map(e=>e.field);
  for(const key of ['department','name','quota','description','requirements'])assert.ok(fields.includes(`positions.position-content.${key}`),key);
});
test('duplicate position IDs or names within the same department are rejected',()=>{
  const input=validCampaign();input.positions.push({...input.positions[0]});
  assert.ok(validateCampaign(input).some(e=>e.field==='positions'));
  input.positions[1].id='another';assert.ok(validateCampaign(input).some(e=>e.field.includes('.name')));
});
test('position linked to an application cannot be removed',()=>{
  assert.equal(canRemovePosition('position-content',[{positionId:'position-content'}]),false);
  assert.equal(canRemovePosition('position-content',[]),true);
});
test('intake includes opening, excludes closing, ignores quota and respects publication',()=>{
  const input=validCampaign();
  assert.equal(getIntakeStatus(input,{published:false,now:input.open}),'draft');
  assert.equal(getIntakeStatus(input,{published:true,now:'2026-10-31T08:00'}),'upcoming');
  assert.equal(getIntakeStatus(input,{published:true,now:input.open}),'open');
  assert.equal(getIntakeStatus(input,{published:true,now:input.close}),'closed');
});
