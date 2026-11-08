import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {renderLayout} from '../src/templates/layout.js';
import {renderCampaign} from '../src/features/campaign/view.js';
import {initialCampaign} from '../src/features/campaign/seed.js';
import {escapeHtml} from '../src/shared/ui.js';

export const pages=[
  {file:'index.html',view:'campaign',title:'Tạo đợt tuyển'},
  {file:'applications.html',view:'applications',title:'Duyệt hồ sơ'},
  {file:'schedule.html',view:'schedule',title:'Xếp lịch phỏng vấn'},
  {file:'discover.html',view:'discover',title:'Khám phá CLB'},
  {file:'recruitment.html',view:'recruitment',title:'Đợt tuyển thành viên'},
  {file:'events.html',view:'events',title:'Sự kiện CLB'},
  {file:'profile.html',view:'profile',title:'Hồ sơ cá nhân'}
];
const root=fileURLToPath(new URL('../',import.meta.url));
export async function generate(){
  for(const page of pages){
    const body=page.view==='campaign'?renderCampaign(initialCampaign):`<h1 class="sr-only">${escapeHtml(page.title)}</h1><section class="blank-canvas" aria-label="${escapeHtml(page.title)}"></section>`;
    await writeFile(path.join(root,page.file),renderLayout({...page,body}).replace(/[\t ]+$/gm,''),'utf8');
  }
  console.log(`Generated ${pages.length} static HTML pages.`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generate();
