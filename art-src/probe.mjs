import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFileSync, existsSync, statSync} from 'node:fs';
import {join, extname} from 'node:path';
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
const srv=createServer((q,s)=>{let f=join('dist',decodeURIComponent(q.url.split('?')[0]));if(existsSync(f)&&statSync(f).isDirectory())f=join(f,'index.html');if(!existsSync(f)){s.writeHead(404).end();return;}s.writeHead(200,{'Content-Type':T[extname(f)]??'application/octet-stream'});s.end(readFileSync(f));}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(`http://127.0.0.1:${srv.address().port}/`);await p.waitForTimeout(1500);
const max=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
for(const f of [0.56,0.65]){await p.evaluate(y=>window.scrollTo(0,y),max*f);await p.waitForTimeout(1200);
console.log(f,await p.evaluate(()=>{const h=document.querySelector('#kareler-title');const r=h.getBoundingClientRect();const s=document.querySelector('#kareler').getBoundingClientRect();const st=document.querySelector('#kareler > div').getBoundingClientRect();return {h:[r.left,r.top,r.width],sec:[s.top,s.height],sticky:[st.top,st.left,st.width], col: getComputedStyle(h).color, op: getComputedStyle(h.parentElement).opacity}}));}
await b.close();srv.close();
