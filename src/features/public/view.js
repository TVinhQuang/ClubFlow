/**
 * Public pages: discover.html, recruitment.html and events.html (recruitment timeline).
 * UX direction (ui-ux-pro-max, landing "Hero + features + CTA"): one primary action per role in the hero
 * and again at the end, open positions visible on the first page, real deadline countdown from the data,
 * the current step of the journey highlighted, an FAQ disclosed on demand, and helpful empty states.
 */
import {escapeHtml as esc,icon,formatDateTime} from '../../shared/ui.js';

const intakeText={draft:['Chưa công bố','pill-draft'],upcoming:['Sắp nhận đơn','pill-draft'],open:['Đang nhận đơn','pill-published'],closed:['Đã đóng đơn','pill-closed']};
const intakePill=status=>{const [text,cls]=intakeText[status]||intakeText.draft;return `<span class="pill ${cls}">${text}</span>`;};
const dateOnly=value=>{if(!/^\d{4}-\d{2}-\d{2}/.test(value||''))return 'Chưa chọn';const [y,m,d]=value.slice(0,10).split('-');return `${d}/${m}/${y}`;};
const quotaTotal=campaign=>(campaign?.positions||[]).reduce((s,p)=>s+(Number(p.quota)||0),0);
const DAY=86400000;
/** Local "YYYY-MM-DDTHH:mm" strings compared on one clock (no time-zone conversion needed). */
const stamp=value=>{const [d,t='00:00']=String(value).split('T');const [y,m,dd]=d.split('-').map(Number);const [h,mi]=t.split(':').map(Number);return Date.UTC(y,m-1,dd,h,mi);};

/** Countdown and elapsed share of the intake window, computed from campaign dates and "now". */
export function intakeProgress(campaign,intake,now){
  if(!campaign||!now)return null;
  const open=stamp(campaign.open),close=stamp(campaign.close),current=stamp(now);
  const percent=Math.round(Math.min(100,Math.max(0,(current-open)/(close-open)*100)));
  const days=Math.ceil((close-current)/DAY),startsIn=Math.ceil((open-current)/DAY);
  const text=intake==='open'?(days<=1?'Hạn chót trong hôm nay':`Còn ${days} ngày để nộp hồ sơ`):intake==='upcoming'?`Mở nhận đơn sau ${startsIn} ngày`:intake==='closed'?'Đã hết hạn nộp hồ sơ':'';
  return {percent,text};
}

/** The single primary action (and an optional secondary one) for each role. */
function heroActions(role,intake){
  const open=intake==='open';
  // Nothing published yet: send people to the timeline instead of an empty positions list.
  if(intake==='draft'&&(role==='visitor'||role==='applicant'))return `<a class="button button-primary" href="events.html">Xem lịch trình tuyển${icon('arrow')}</a>${role==='visitor'?'<a class="button button-secondary" href="login.html">Đăng nhập</a>':''}`;
  const primary={
    visitor:['#positions-title','Xem vị trí đang tuyển'],
    applicant:open?['apply.html','Nộp đơn ngay']:['#positions-title','Xem vị trí đang tuyển'],
    executive:['index.html','Quản lý đợt tuyển'],
    interviewer:['interviews.html','Lịch phỏng vấn của tôi']
  }[role]||['recruitment.html','Xem đợt tuyển'];
  const secondary={visitor:['login.html','Đăng nhập để ứng tuyển'],applicant:['my-applications.html','Hồ sơ của tôi'],executive:['recruitment.html','Xem trang đợt tuyển'],interviewer:['recruitment.html','Xem đợt tuyển']}[role];
  return `<a class="button button-primary" href="${primary[0]}">${primary[1]}${icon('arrow')}</a>${secondary?`<a class="button button-secondary" href="${secondary[0]}">${secondary[1]}</a>`:''}`;
}

function countdown(progress,label){
  if(!progress)return '';
  return `<div class="countdown"><div class="countdown-head"><span>${icon('clock')}${esc(progress.text)}</span><span class="countdown-pct">${progress.percent}%</span></div><progress class="countdown-bar" max="100" value="${progress.percent}" aria-label="${esc(label)}: đã qua ${progress.percent}% thời gian nhận đơn"></progress></div>`;
}

function emptyCampaign(role){
  return `<div class="empty-state page-empty">${icon('calendar')}<h2>Chưa có đợt tuyển đang công bố</h2><p>Khi câu lạc bộ công bố đợt tuyển, các vị trí và thời gian nhận đơn sẽ xuất hiện tại đây. Bạn vẫn có thể đọc hành trình ứng tuyển và câu hỏi thường gặp.</p>${role==='executive'?'<a class="button button-primary" href="index.html">Chuẩn bị đợt tuyển</a>':'<a class="button button-secondary" href="events.html">Xem lịch trình</a>'}</div>`;
}

/** Journey steps take their state from the same milestones as the timeline page. */
function journeySteps(items){
  const pick=i=>items[i]?.state||'upcoming';
  const intake=pick(1)==='done'?'done':pick(0)==='done'?'current':'upcoming';
  const review=pick(2)==='done'?'done':pick(1)==='done'?'current':'upcoming';
  return [
    ['upload','Nộp hồ sơ','Chọn vị trí, gửi CV PDF và chọn giờ rảnh phỏng vấn.',intake],
    ['file','Duyệt CV','Ban tuyển dụng đọc hồ sơ và chọn người vào vòng phỏng vấn.',review],
    ['calendar','Phỏng vấn','Bạn nhận lịch, phòng và người phỏng vấn trong tài khoản.',pick(3)],
    ['trophy','Kết quả','Kết quả từng vị trí hiển thị trong mục Hồ sơ của tôi.',pick(4)]
  ];
}

function faq(config){
  const items=[
    ['Tôi có thể ứng tuyển nhiều vị trí không?','Có. Mỗi vị trí cần một hồ sơ riêng và được xét độc lập; bạn không thể nộp hai lần cho cùng một vị trí.'],
    ['CV và nguyện vọng cần như thế nào?','CV định dạng PDF, tối đa 5 MB. Phần nguyện vọng tối đa 300 từ. Bạn cũng chọn các khung giờ có thể phỏng vấn.'],
    ['Khi nào tôi biết lịch phỏng vấn?',`Sau khi đóng nhận đơn, ban tuyển dụng xếp và xác nhận lịch. Ngày phỏng vấn dự kiến ${dateOnly(config?.date)}; giờ, phòng và người phỏng vấn hiển thị trong mục Hồ sơ của tôi.`],
    ['Kết quả được thông báo ra sao?','Kết quả Đạt/Không đạt của từng vị trí hiển thị trong mục Hồ sơ của tôi và qua thông báo trong ứng dụng.'],
    ['Ai được xem hồ sơ của tôi?','Ban điều hành của câu lạc bộ và người phỏng vấn được giao cho hồ sơ đó. Ghi chú nội bộ của vòng CV không hiển thị cho ứng viên hay người phỏng vấn.']
  ];
  return `<section class="page-section" aria-labelledby="faq-title"><h2 id="faq-title">Câu hỏi thường gặp</h2><div class="faq">${items.map(([q,a])=>`<details class="faq-item"><summary>${esc(q)}${icon('down')}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`;
}

export function renderDiscover(data){
  const {campaign,intake,role,config,now}=data;
  const progress=intakeProgress(campaign,intake,now);
  const steps=journeySteps(timelineItems(data));
  const stateLabel=now?{done:'Đã xong',current:'Đang diễn ra',upcoming:'Sắp tới'}:{};
  return `<section class="hero-panel">
    <div class="hero-copy">
      <p class="eyebrow">CLB Truyền thông HCMUS</p>
      <h1>Cùng nhau kể những câu chuyện sinh viên đáng nhớ</h1>
      <p>Viết, thiết kế, chụp ảnh và tổ chức sự kiện — tìm vị trí phù hợp và đồng hành cùng câu lạc bộ trong mùa tuyển mới.</p>
      <div class="hero-actions">${heroActions(role,campaign?intake:'draft')}</div>
    </div>
    <div class="hero-card">
      ${campaign?`<div class="hero-card-top">${intakePill(intake)}<span>${esc(campaign.club)}</span></div>
      <h2>${esc(campaign.name)}</h2>
      ${countdown(progress,campaign.name)}
      <dl class="fact-grid">
        <div><dt>Hạn nhận đơn</dt><dd>${esc(formatDateTime(campaign.close))}</dd></div>
        <div><dt>Phỏng vấn dự kiến</dt><dd>${esc(dateOnly(config?.date))}</dd></div>
        <div><dt>Vị trí</dt><dd>${campaign.positions.length}</dd></div>
        <div><dt>Chỉ tiêu</dt><dd>${quotaTotal(campaign)} thành viên</dd></div>
      </dl>`:`<span class="pill pill-draft">Chưa công bố</span><h2>Đợt tuyển mới sắp ra mắt</h2><p class="muted-text">Câu lạc bộ đang chuẩn bị đợt tuyển. Thông tin vị trí và hạn nộp sẽ xuất hiện tại đây khi được công bố.</p>`}
    </div>
  </section>
  <section class="page-section" aria-labelledby="positions-title">
    <div class="section-head"><h2 id="positions-title" tabindex="-1">Vị trí đang tuyển</h2>${campaign?`<a class="button button-quiet" href="recruitment.html">Xem tất cả chi tiết${icon('arrow')}</a>`:''}</div>
    ${campaign?`<ul class="role-grid">${campaign.positions.map(p=>`<li><a class="role-card" href="recruitment.html#role-${esc(p.id)}">
      <span class="role-card-dept">${esc(p.department)}</span>
      <strong>${esc(p.name)}</strong>
      <span class="role-card-desc">${esc(p.description)}</span>
      <span class="role-card-foot"><span class="pill pill-published">${esc(p.quota)} chỉ tiêu</span><span class="role-card-more">Chi tiết${icon('arrow')}</span></span>
    </a></li>`).join('')}</ul>`:emptyCampaign(role)}
  </section>
  <section class="page-section" aria-labelledby="journey-title">
    <div class="section-head"><h2 id="journey-title">Hành trình ứng tuyển</h2><a class="button button-quiet" href="events.html">Xem lịch trình chi tiết${icon('arrow')}</a></div>
    <ol class="journey">${steps.map(([i,t,d,state],n)=>`<li class="journey-${state}"${state==='current'?' aria-current="step"':''}><span class="journey-icon">${icon(state==='done'?'check':i)}</span><span class="journey-step">Bước ${n+1}${stateLabel[state]?` · <span class="journey-state">${stateLabel[state]}</span>`:""}</span><strong>${t}</strong><p>${d}</p></li>`).join('')}</ol>
  </section>
  ${faq(config)}
  <section class="cta-band" aria-labelledby="cta-title">
    <div><h2 id="cta-title">Sẵn sàng đồng hành cùng câu lạc bộ?</h2><p>${campaign&&intake==='open'?esc(progress?.text||''):'Theo dõi lịch trình để không bỏ lỡ đợt tuyển.'}</p></div>
    <div class="hero-actions">${heroActions(role,campaign?intake:'draft')}</div>
  </section>`;
}

export function renderRecruitment(data){
  const {campaign,intake,role,interviewDate,now}=data;
  if(!campaign)return `<div class="page-heading"><div><h1>Đợt tuyển thành viên</h1><p>Thông tin đợt tuyển đang mở của câu lạc bộ.</p></div></div>${emptyCampaign(role)}`;
  const open=intake==='open',progress=intakeProgress(campaign,intake,now);
  const applyLink=id=>role==='applicant'?`apply.html?position=${encodeURIComponent(id)}`:role==='visitor'?'login.html':'';
  const cta=open&&(role==='applicant'||role==='visitor')?`<a class="button button-primary" href="${role==='applicant'?'apply.html':'login.html'}">${role==='visitor'?'Đăng nhập để ứng tuyển':'Ứng tuyển ngay'}${icon('arrow')}</a>`:'';
  return `<div class="page-heading">
    <div><p class="eyebrow">${esc(campaign.club)}</p><h1>${esc(campaign.name)}</h1><p>${esc(campaign.description)}</p></div>
    <div class="heading-actions">${cta}</div>
  </div>
  <div class="campaign-ribbon recruit-ribbon" role="region" aria-label="Thời gian đợt tuyển">
    <div class="ribbon-main">${icon('calendar')}<div><strong>Nhận đơn ${esc(formatDateTime(campaign.open))} – ${esc(formatDateTime(campaign.close))}</strong><small>Phỏng vấn dự kiến ngày ${esc(dateOnly(interviewDate))}</small></div></div>
    <div class="ribbon-meta">${intakePill(intake)}</div>
    ${countdown(progress,campaign.name)}
  </div>
  ${!open?`<div class="notice" role="status">${icon('info')}<div><strong>${intake==='closed'?'Đợt tuyển đã đóng đơn':'Đợt tuyển chưa mở nhận đơn'}</strong><p>${intake==='closed'?'Câu lạc bộ không nhận thêm hồ sơ cho đợt này. Hồ sơ đã nộp vẫn được theo dõi trong mục Hồ sơ của tôi.':`Bạn có thể nộp đơn từ ${esc(formatDateTime(campaign.open))}.`}</p></div></div>`:''}
  <section class="page-section" aria-labelledby="positions-title">
    <h2 id="positions-title">${campaign.positions.length} vị trí · ${quotaTotal(campaign)} thành viên</h2>
    <nav class="jump-nav" aria-label="Đi tới vị trí">${campaign.positions.map(p=>`<a href="#role-${esc(p.id)}">${esc(p.name)}</a>`).join('')}</nav>
    <div class="position-cards">${campaign.positions.map(p=>`<article class="position-card" id="role-${esc(p.id)}" tabindex="-1" aria-labelledby="role-${esc(p.id)}-title">
      <div class="position-card-head"><div><h3 id="role-${esc(p.id)}-title">${esc(p.name)}</h3><p>${esc(p.department)}</p></div><span class="pill pill-published">${esc(p.quota)} chỉ tiêu</span></div>
      <h4>Mô tả công việc</h4><p>${esc(p.description)}</p>
      <h4>Yêu cầu</h4><p>${esc(p.requirements)}</p>
      ${open&&applyLink(p.id)?`<div class="position-card-actions"><a class="button button-secondary button-small" href="${applyLink(p.id)}" aria-label="${role==='visitor'?'Đăng nhập để ứng tuyển':'Ứng tuyển'} vị trí ${esc(p.name)}">${role==='visitor'?'Đăng nhập để ứng tuyển':'Ứng tuyển vị trí này'}${icon('arrow')}</a></div>`:''}
    </article>`).join('')}</div>
  </section>
  <section class="page-section info-panel" aria-labelledby="guide-title"><h2 id="guide-title">Hướng dẫn ứng tuyển</h2><p>${esc(campaign.instructions)}</p><p class="muted-text">Mỗi vị trí cần một hồ sơ riêng; không nộp trùng một vị trí.</p></section>`;
}

/** Recruitment milestones derived from the campaign, schedule and results. `at` is used for countdowns. */
export function timelineItems({campaign,config,confirmedAt,resultsAt,now}){
  if(!campaign)return [];
  const state=(done,current)=>done?'done':current?'current':'upcoming';
  const interviewStart=`${config.date}T${config.start}`,interviewEnd=`${config.date}T${config.end}`;
  return [
    {title:'Mở nhận đơn',when:formatDateTime(campaign.open),at:campaign.open,text:'Ứng viên đăng nhập và nộp hồ sơ cho từng vị trí.',state:state(now>=campaign.open,false)},
    {title:'Đóng nhận đơn',when:formatDateTime(campaign.close),at:campaign.close,text:'Ban tuyển dụng hoàn tất duyệt CV.',state:state(now>=campaign.close,now>=campaign.open)},
    {title:'Xác nhận lịch phỏng vấn',when:confirmedAt?formatDateTime(confirmedAt):'Sau khi đóng đơn',at:null,text:'Lịch chính thức hiển thị trong tài khoản ứng viên và người phỏng vấn.',state:state(Boolean(confirmedAt),now>=campaign.close)},
    {title:'Ngày phỏng vấn',when:`${dateOnly(config.date)} · ${config.start}–${config.end}`,at:interviewStart,text:`Mỗi buổi ${config.duration} phút.`,state:state(now>=interviewEnd,now>=interviewStart)},
    {title:'Công bố kết quả',when:resultsAt?formatDateTime(resultsAt):'Sau ngày phỏng vấn',at:null,text:'Kết quả Đạt/Không đạt của từng vị trí hiển thị trong ứng dụng.',state:state(Boolean(resultsAt),now>=interviewEnd)}
  ];
}

/** What the viewer can do at the current milestone, by role. */
function milestoneAction(index,role){
  const map={
    1:{applicant:['apply.html','Nộp đơn'],visitor:['login.html','Đăng nhập để ứng tuyển'],executive:['applications.html','Duyệt hồ sơ']},
    2:{executive:['schedule.html','Xếp lịch phỏng vấn'],applicant:['my-applications.html','Theo dõi hồ sơ']},
    3:{interviewer:['interviews.html','Lịch phỏng vấn của tôi'],applicant:['my-applications.html','Xem lịch của tôi'],executive:['schedule.html','Xem lịch']},
    4:{executive:['results.html','Kết quả tuyển'],applicant:['my-applications.html','Xem kết quả']}
  };
  const action=map[index]?.[role];
  return action?`<a class="button button-secondary button-small" href="${action[0]}">${action[1]}${icon('arrow')}</a>`:'';
}

export function renderEvents(data){
  // Without a real "now" (static HTML snapshot) the page lists milestones without stale progress labels.
  const items=timelineItems(data),labels=data.now?{done:'Đã xong',current:'Giai đoạn hiện tại',upcoming:'Sắp tới'}:{done:'',current:'',upcoming:''};
  const currentIndex=items.findIndex(i=>i.state==='current');
  // A milestone is a moment; "now" is the phase leading up to it.
  const phases=[null,['Đang nhận hồ sơ','Ứng viên nộp hồ sơ, ban tuyển dụng duyệt CV song song.'],['Đang xếp lịch phỏng vấn','Ban điều hành xếp và xác nhận lịch cho các hồ sơ qua vòng CV.'],['Đang phỏng vấn','Các buổi phỏng vấn diễn ra theo lịch đã xác nhận.'],['Chờ công bố kết quả','Người phỏng vấn gửi đánh giá, ban điều hành ghi quyết định.']];
  const phase=currentIndex>0?phases[currentIndex]:null;
  const next=items.find(i=>i.state==='upcoming'||i.state==='current'&&i.at&&i.at>data.now);
  const days=next?.at?Math.ceil((stamp(next.at)-stamp(data.now))/DAY):null;
  return `<div class="page-heading"><div><h1>Lịch trình đợt tuyển</h1><p>Các mốc chính của ${data.campaign?esc(data.campaign.name):'đợt tuyển'}, cập nhật theo trạng thái hiện tại.</p></div></div>
  ${items.length?`${data.now?`<div class="now-strip">
      <div class="now-card"><span class="now-label">Hiện tại</span><strong>${esc(phase?phase[0]:items.every(i=>i.state==='done')?'Đợt tuyển đã hoàn tất':'Chưa mở nhận đơn')}</strong>${phase?`<span class="muted-text">${esc(phase[1])}</span>`:''}</div>
      <div class="now-card"><span class="now-label">Mốc tiếp theo</span><strong>${esc(next?next.title:'Không còn mốc nào')}</strong>${next?`<span class="muted-text">${esc(next.when)}${days!==null&&days>0?` · còn ${days} ngày`:''}</span>`:''}</div>
    </div>`:''}
    <ol class="timeline">${items.map((i,n)=>`<li class="timeline-item timeline-${i.state}"${i.state==='current'?' aria-current="step"':''}><span class="timeline-dot" aria-hidden="true">${icon(i.state==='done'?'check':i.state==='current'?'clock':'calendar')}</span><div class="timeline-body"><div class="timeline-head"><h2>${esc(i.title)}</h2><span class="timeline-state">${labels[i.state]}</span></div><p class="timeline-when">${esc(i.when)}</p><p>${esc(i.text)}</p>${i.state==='current'?milestoneAction(n,data.role):''}</div></li>`).join('')}</ol>`:emptyCampaign(data.role)}`;
}

export function renderPublic(view,data){
  if(view==='discover')return renderDiscover(data);
  if(view==='recruitment')return renderRecruitment(data);
  if(view==='events')return renderEvents(data);
  return `<h1 class="sr-only">ClubFlow</h1>`;
}
