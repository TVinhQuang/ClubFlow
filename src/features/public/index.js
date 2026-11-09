/** Public controller: discover.html, recruitment.html and events.html. */
import {getIntakeStatus} from '../campaign/model.js';
import {localNow} from '../schedule/model.js';
import {scheduleSnapshot} from '../schedule/snapshot.js';
import {renderPublic} from './view.js';

export function mount(container,services){
  const user=services.session.getUser();
  const campaign=services.campaignStore.getPublished();
  const snap=scheduleSnapshot(services);
  const intake=campaign?getIntakeStatus(campaign,{published:true}):'draft';
  container.innerHTML=renderPublic(document.body.dataset.view,{user,role:user.role,campaign,intake,interviewDate:snap.config.date,config:snap.config,confirmedAt:snap.confirmedAt,resultsAt:services.resultsStore.getPublishedAt(),now:localNow()});
  // Deep links (discover → recruitment#role-…) must land on the card after this re-render.
  const target=location.hash&&document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if(target){requestAnimationFrame(()=>{target.scrollIntoView({block:'start',behavior:'auto'});target.focus({preventScroll:true});});}
  return ()=>{};
}
