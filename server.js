const http=require('http'),fs=require('fs'),path=require('path');
const {SETTINGS,CHARACTERS,ITEMS,EVENTS,nodes,adj,STAR_NODES,START}=require('./public/game-data.js');
const rooms={},rnd=n=>Math.floor(Math.random()*n)+1,pick=a=>a[rnd(a.length)-1];
const newGame=()=>({phase:'lobby',seats:[],turn:0,round:1,starAt:STAR_NODES[0],seq:0,trail:[],pending:null,roll:0,log:['Lobby open. Join and pick a character.']});
const newSeat=(id,name,char)=>({id,name,char,coins:0,stars:0,items:[],pos:START,prev:null,bonus:0,dbl:false});
const room=c=>rooms[c]||(rooms[c]={S:newGame(),cl:new Set()});
const log=(S,m)=>{S.log.unshift(m);S.log=S.log.slice(0,30)};
const nm=(S,i)=>{const s=S.seats[i],c=CHARACTERS.find(x=>x.id===s.char);return c.emoji+' '+s.name};
function startGame(S){S.phase='play';S.turn=0;S.round=1;S.pending=null;S.trail=[];S.seats.forEach(s=>{const c=CHARACTERS.find(x=>x.id===s.char);Object.assign(s,{coins:SETTINGS.startCoins+(c.startCoins||0),stars:0,items:[],pos:START,prev:null,bonus:0,dbl:false})});S.starAt=pick(STAR_NODES);log(S,'Game on! Round 1.')}
function endTurn(S){S.pending=null;S.turn++;if(S.turn>=S.seats.length){S.turn=0;S.round++;if(S.round>SETTINGS.maxRounds){S.phase='over';log(S,'Game over!')}else log(S,'— Round '+S.round+' —')}}
function land(S,p){const n=nodes[p.pos],w=nm(S,S.turn);S.pending=null;
 if(n.t==='blue'){p.coins+=3;log(S,w+' +3 coins')}else if(n.t==='red'){p.coins=Math.max(0,p.coins-3);log(S,w+' −3 coins')}
 else if(n.t==='item'){if(p.items.length<SETTINGS.maxItems){const it=pick(ITEMS);p.items.push(it.id);log(S,w+' found '+it.emoji+' '+it.name)}else log(S,w+' found an item but the bag is full')}
 else if(n.t==='event'){const e=pick(EVENTS);p.coins=Math.max(0,p.coins+e.coins);log(S,w+': '+e.t+' ('+(e.coins>0?'+':'')+e.coins+')')}
 endTurn(S)}
function walk(S,p,steps){const trail=[];
 while(steps>0){let o=adj[p.pos].filter(n=>n!==p.prev);if(!o.length)o=adj[p.pos].slice();
  if(o.length>1){S.pending={type:'fork',opts:o,left:steps};break}
  p.prev=p.pos;p.pos=o[0];trail.push(p.pos);steps--;
  if(p.pos===S.starAt&&p.coins>=SETTINGS.starCost){S.pending={type:'star',left:steps};break}}
 S.trail=trail;if(!S.pending)land(S,p)}
function roll(S){const p=S.seats[S.turn],c=CHARACTERS.find(x=>x.id===p.char);let r=rnd(10);if(p.dbl){r+=rnd(10);p.dbl=false}
 const tot=r+(c.rollBonus||0)+p.bonus;log(S,nm(S,S.turn)+' rolled '+r+(tot!==r?' (+'+(tot-r)+' = '+tot+')':''));p.bonus=0;S.roll=tot;walk(S,p,tot)}
function choose(S,n){const p=S.seats[S.turn],l=S.pending.left-1;S.pending=null;p.prev=p.pos;p.pos=n;S.trail=[n];
 if(p.pos===S.starAt&&p.coins>=SETTINGS.starCost)S.pending={type:'star',left:l};else if(l>0)walk(S,p,l);else land(S,p)}
function starAns(S,buy){const p=S.seats[S.turn],left=S.pending.left;S.pending=null;
 if(buy){p.coins-=SETTINGS.starCost;p.stars++;log(S,nm(S,S.turn)+' bought a ⭐!');S.starAt=pick(STAR_NODES.filter(x=>x!==S.starAt))}
 S.trail=[];if(left>0)walk(S,p,left);else land(S,p)}
function useItem(S,k){const p=S.seats[S.turn],it=ITEMS.find(x=>x.id===p.items[k]);if(!it)return;
 if(it.type==='dice')p.bonus+=it.n;else if(it.type==='double')p.dbl=true;else if(it.type==='coins')p.coins+=it.n;
 else if(it.type==='steal'){const v=S.seats.filter((s,i)=>i!==S.turn&&s.coins>0);if(!v.length)return;const t=pick(v),a=Math.min(it.n,t.coins);t.coins-=a;p.coins+=a}
 p.items.splice(k,1);S.trail=[];log(S,nm(S,S.turn)+' used '+it.emoji+' '+it.name)}
function act(S,id,a){const i=S.seats.findIndex(s=>s.id===id),t=S.phase==='play'&&i===S.turn;
 switch(a.type){
 case'join':{if(S.phase!=='lobby')return false;const c=CHARACTERS.find(x=>x.id===a.char);if(!c||S.seats.some(s=>s.char===c.id&&s.id!==id))return false;
  const n=String(a.name||'').trim().slice(0,16)||'Player';if(i>=0){S.seats[i].char=c.id;S.seats[i].name=n}else if(S.seats.length<4)S.seats.push(newSeat(id,n,c.id));else return false;return true}
 case'leave':if(S.phase==='lobby'&&i>=0){S.seats.splice(i,1);return true}return false;
 case'start':if(S.phase==='lobby'&&i===0&&S.seats.length>=2){startGame(S);return true}return false;
 case'roll':if(t&&!S.pending){roll(S);return true}return false;
 case'choose':if(t&&S.pending&&S.pending.type==='fork'&&S.pending.opts.includes(a.node)){choose(S,a.node);return true}return false;
 case'star':if(t&&S.pending&&S.pending.type==='star'){starAns(S,!!a.buy);return true}return false;
 case'item':if(t&&!S.pending){useItem(S,a.k|0);return true}return false;
 case'reset':if(i===0&&S.phase==='over'){const k=S.seats.map(s=>newSeat(s.id,s.name,s.char));Object.assign(S,newGame(),{seats:k,seq:S.seq});return true}return false}
 return false}
const view=(S,id)=>JSON.stringify({...S,seats:S.seats.map(({id:_,...r})=>r),you:S.seats.findIndex(s=>s.id===id)});
const push=r=>{r.S.seq++;r.cl.forEach(c=>c.res.write('data: '+view(r.S,c.id)+'\n\n'))};
const MIME={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css'};
http.createServer((req,res)=>{const u=new URL(req.url,'http://x'),code=(u.searchParams.get('room')||'main').replace(/[^\w-]/g,'').slice(0,24)||'main',id=(u.searchParams.get('id')||'').slice(0,64);
 if(u.pathname==='/events'&&id){const r=room(code),c={res,id};res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});
  res.write('retry: 2000\ndata: '+view(r.S,id)+'\n\n');r.cl.add(c);const ping=setInterval(()=>res.write(': ping\n\n'),20000);
  req.on('close',()=>{clearInterval(ping);r.cl.delete(c)});return}
 if(u.pathname==='/act'&&req.method==='POST'&&id){let b='';req.on('data',d=>{b+=d;if(b.length>2000)req.destroy()});
  req.on('end',()=>{let a;try{a=JSON.parse(b)}catch{res.writeHead(400);return res.end()}const r=room(code);let ok=false;try{ok=act(r.S,id,a)}catch(e){console.error(e)}if(ok)push(r);res.writeHead(ok?200:409);res.end()});return}
 let f=u.pathname==='/'?'/index.html':u.pathname;const fp=path.join(__dirname,'public',path.normalize(f));
 if(!fp.startsWith(path.join(__dirname,'public'))||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404);return res.end('Not found')}
 res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});fs.createReadStream(fp).pipe(res)
}).listen(process.env.PORT||3000,()=>console.log('Party board running on port '+(process.env.PORT||3000)));
