import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
export function createServer(base=root){
  return http.createServer(async(req,res)=>{
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end('Bad request');return;}
    const relative=pathname==='/'?'index.html':pathname.slice(1),file=path.resolve(base,relative);
    if(!file.startsWith(path.resolve(base)+path.sep)||pathname.includes('\\')||relative.split('/').some(part=>part.startsWith('.'))){res.writeHead(403).end('Forbidden');return;}
    if(!/^(?:[^/]+\.html|(?:src|assets)\/.+\.(?:js|css|svg|png|jpg|woff2))$/.test(relative)){res.writeHead(404).end('Not found');return;}
    try{const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);}
    catch{res.writeHead(404).end('Not found');}
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||4173),server=createServer();
  server.listen(port,'127.0.0.1',()=>console.log(`ClubFlow: http://127.0.0.1:${server.address().port}`));
}
