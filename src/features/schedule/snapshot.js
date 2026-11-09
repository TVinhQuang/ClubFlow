/** Read-only view of the schedule for other pages (applicant, interviewer, results, timeline). */
import {evaluateSchedule} from './model.js';
import {initialApplicantAvailability} from './seed.js';

export function scheduleSnapshot({scheduleStore,applicationsStore}){
  const config=scheduleStore.getConfig(),confirmedAt=scheduleStore.getMeta().confirmedAt;
  const applications=applicationsStore.getAll();
  const rows=evaluateSchedule({candidates:applications.filter(a=>a.status==='shortlisted'),config,availability:initialApplicantAvailability,assignments:scheduleStore.getAssignments(),confirmedAt});
  return {config,confirmedAt,rows,applications};
}
/** Local "YYYY-MM-DDTHH:mm" start of an interview row. */
export const interviewStart=(config,row)=>row.assignment?`${config.date}T${row.assignment.start}`:'';
