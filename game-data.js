/* Shared by server and browser. EDIT characters / items / events / settings here. */
(function(g){
const SETTINGS={starCost:20,maxRounds:10,startCoins:10,maxItems:3};
const CHARACTERS=[
 {id:'c1',name:'Red Runner',emoji:'🦊',color:'#e63946',perk:'Starts with +5 coins',startCoins:5,rollBonus:0},
 {id:'c2',name:'Blue Bolt',emoji:'🐸',color:'#3a86ff',perk:'+1 to every roll',startCoins:0,rollBonus:1},
 {id:'c3',name:'Green Gizmo',emoji:'🤖',color:'#2ec4b6',perk:'Starts with +5 coins',startCoins:5,rollBonus:0},
 {id:'c4',name:'Gold Goblin',emoji:'👺',color:'#f4a261',perk:'+1 to every roll',startCoins:0,rollBonus:1}
];
/* type: dice (add n to next roll) | coins (gain n) | steal (take n from a random rival) | double (two dice next roll) */
const ITEMS=[
 {id:'i1',name:'Turbo Shroom',emoji:'🍄',type:'dice',n:3,desc:'+3 to your next roll'},
 {id:'i2',name:'Double Die',emoji:'🎲',type:'double',n:0,desc:'Roll two dice next turn'},
 {id:'i3',name:'Coin Pouch',emoji:'💰',type:'coins',n:6,desc:'Gain 6 coins'},
 {id:'i4',name:'Sticky Fingers',emoji:'🧤',type:'steal',n:5,desc:'Steal 5 coins from a random rival'}
];
const EVENTS=[{t:'Found a coin purse!',coins:5},{t:'Tripped over a banana…',coins:-4},{t:'Lucky penny!',coins:2},{t:'Pickpocketed by a ghost!',coins:-3},{t:'Bonus round payout!',coins:4}];
/* ---- board (traced from Goomba's Greedy Gala screenshot, 1024x768) ---- */
const START='908,625',nodes={},adj={};
function addSeg(pts){for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]];const n=a[2]||1;
 for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,y=a[1]+(b[1]-a[1])*k/n,id=Math.round(x)+','+Math.round(y);
  if(!nodes[id]){nodes[id]={id,x,y};adj[id]=[]}
  if(k>0){const px=a[0]+(b[0]-a[0])*(k-1)/n,py=a[1]+(b[1]-a[1])*(k-1)/n,pid=Math.round(px)+','+Math.round(py);
   if(!adj[id].includes(pid)){adj[id].push(pid);adj[pid].push(id)}}}}}
[
 [[125,145,5],[333,145,1],[333,180,2],[412,180,3],[412,312,2],[412,383,1],[490,440]],
 [[125,145,4],[122,312,3],[112,453,4],[97,605,6],[362,605,4],[362,453]],
 [[122,312,7],[412,312]],[[112,453,6],[362,453]],
 [[362,491,1],[405,492,1],[490,440]],[[573,380,1],[490,440]],[[575,492,1],[490,440]],[[490,527,1],[490,440]],
 [[575,492,4],[745,492,3],[755,605,1],[757,644]],
 [[573,380,1],[573,347,5],[572,146,5],[772,147,1],[772,180,3],[898,180,4],[908,347,4],[920,490,2],[838,490,3],[838,600,2],[755,605]],
 [[573,347,4],[743,347,4],[908,347]],[[743,347,4],[745,492]],
 [[490,643,3],[490,527]],[[490,643,6],[757,644]],[[838,600,1],[908,625]]
].forEach(addSeg);
Object.values(nodes).forEach(n=>{const t=(Math.round(n.x/10)*7+Math.round(n.y/10)*3)%11;n.t=n.id===START?'start':t<5?'blue':t<7?'red':t<8?'item':t<9?'event':'blue'});
const STAR_NODES=[[905,215],[650,644],[122,175],[100,530]].map(([x,y])=>Object.values(nodes).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0].id);
const api={SETTINGS,CHARACTERS,ITEMS,EVENTS,nodes,adj,STAR_NODES,START};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else g.GD=api;
})(typeof window!=='undefined'?window:this);
