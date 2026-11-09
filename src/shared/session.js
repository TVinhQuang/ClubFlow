import {accounts,findAccount,visitor} from './accounts.js';

export const SESSION_KEY='clubflow.pa2.session.v1';
/**
 * Which sample account is active in this browser. With no stored choice the Executive is used,
 * so the three management screens open directly as before. Signing out stores an explicit visitor.
 */
export function createSession(storage){
  let userId=accounts[0].id;
  try{const raw=storage?.getItem(SESSION_KEY);if(raw){const parsed=JSON.parse(raw);userId=parsed?.userId===null?null:findAccount(parsed?.userId)?parsed.userId:userId;}}catch{}
  const write=()=>{try{storage?.setItem(SESSION_KEY,JSON.stringify({userId}));return true;}catch{return false;}};
  return {
    getUser:()=>userId?findAccount(userId)||visitor:visitor,
    signIn(id){if(!findAccount(id))return false;userId=id;write();return true;},
    signOut(){userId=null;write();}
  };
}
