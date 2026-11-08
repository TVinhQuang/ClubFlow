import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCampaign,renderPreview,fieldId} from '../src/features/campaign/view.js';
import {initialCampaign} from '../src/features/campaign/seed.js';

test('campaign form has one h1, unique IDs and a target for each position field',()=>{
  const html=renderCampaign(initialCampaign);
  assert.equal([...html.matchAll(/<h1\b/g)].length,1);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const position of initialCampaign.positions)for(const field of ['name','department','quota','description','requirements'])assert.ok(ids.includes(fieldId(`positions.${position.id}.${field}`)));
  assert.ok(!html.includes('Chưa thể lưu dữ liệu'),'new draft must not claim storage is blocked');
  assert.ok(html.includes('Chưa lưu bản nháp'),'seed data must not be reported as already saved');
});
test('preview shows all position details, safely escapes content and has no controls or IDs',()=>{
  const campaign=structuredClone(initialCampaign);campaign.name='<img src=x onerror=alert(1)>';
  const html=renderPreview(campaign,{full:true});
  assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));assert.ok(!/\bid="|<button|<input|<textarea/.test(html));
  for(const p of campaign.positions){assert.ok(html.includes(p.department));assert.ok(html.includes(p.description));assert.ok(html.includes(p.requirements));}
});
test('published campaigns retain the pending-edits status after saving a newer draft',()=>{
  const html=renderCampaign(initialCampaign,{hasPublished:true,hasUnpublishedChanges:true,dirty:false,persisted:true});
  assert.ok(html.includes('Có thay đổi chưa công bố'));
});
test('structural edits show an unsaved message after re-rendering the form',()=>{
  const html=renderCampaign(initialCampaign,{dirty:true,persisted:true,savedAt:'2026-11-07T03:00:00Z'});
  assert.ok(html.includes('Có thay đổi chưa lưu bản nháp'));
});
