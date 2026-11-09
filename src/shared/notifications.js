/** In-app notifications kept in this browser. Nothing is emailed or sent to a server. */
export const NOTIFICATIONS_KEY='clubflow.pa2.notifications.v1';

export function createNotifications(storage,{now=()=>new Date().toISOString()}={}){
  let list=[];
  try{const parsed=JSON.parse(storage?.getItem(NOTIFICATIONS_KEY)||'[]');if(Array.isArray(parsed))list=parsed.filter(n=>n&&typeof n.id==='string'&&typeof n.userId==='string'&&typeof n.message==='string');}catch{}
  const write=()=>{try{storage?.setItem(NOTIFICATIONS_KEY,JSON.stringify(list));return true;}catch{return false;}};
  return {
    list:userId=>list.filter(n=>n.userId===userId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),
    unread:userId=>list.filter(n=>n.userId===userId&&!n.read).length,
    add(items){
      const added=items.map((n,i)=>({id:`nt-${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2,6)}`,userId:n.userId,message:n.message,href:n.href||'',createdAt:now(),read:false}));
      list.push(...added);return {ok:true,persisted:write(),added};
    },
    markAllRead(userId){for(const n of list)if(n.userId===userId)n.read=true;write();}
  };
}
