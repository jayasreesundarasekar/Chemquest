// Starfield background — tiny pixel stars with subtle parallax
const starCanvas = document.getElementById('starfield');
const starCtx = starCanvas.getContext('2d');
let stars = [], sw = 0, sh = 0, pointer = {x:0,y:0};

function resizeStars(){
sw=starCanvas.width=innerWidth*devicePixelRatio;
sh=starCanvas.height=innerHeight*devicePixelRatio;
starCanvas.style.width=innerWidth+'px';
starCanvas.style.height=innerHeight+'px';
starCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
stars=Array.from({length:Math.min(240,Math.floor(innerWidth/4))},()=>({
x:Math.random()*innerWidth,
y:Math.random()*innerHeight,
size:Math.random()<.12?2:1,
alpha:.2+Math.random()*.8,
phase:Math.random()*6.28,
speed:.1+Math.random()*.6,
color:Math.random()<.09?'#b9a2ff':Math.random()<.06?'#72eaff':'#f5efff'
}))
}

function drawStars(t=0){
starCtx.clearRect(0,0,innerWidth,innerHeight);
for(const s of stars){
let tw=.55+.45*Math.sin(t*.001*s.speed+s.phase);
starCtx.globalAlpha=s.alpha*tw;
starCtx.fillStyle=s.color;
starCtx.fillRect(
s.x+pointer.x*.012*s.speed,
s.y+pointer.y*.012*s.speed,
s.size,s.size
);
if(s.y>innerHeight+2){
s.y=-2;
s.x=Math.random()*innerWidth
}
}
starCtx.globalAlpha=1;
requestAnimationFrame(drawStars)
}

addEventListener('resize',resizeStars);
addEventListener('pointermove',e=>{
pointer.x=e.clientX-innerWidth/2;
pointer.y=e.clientY-innerHeight/2
});
resizeStars();
requestAnimationFrame(drawStars);

// Pixel-style pseudo-3D molecule viewer.
const canvas=document.getElementById('molecule-canvas');
const ctx=canvas.getContext('2d');

const specimen={
water:{
name:'WATER',
formula:'H₂O',
note:'A tiny molecule with a universe of importance. Two hydrogen atoms orbit one oxygen.',
atoms:[
{x:0,y:0,z:0,e:'O'},
{x:-1.1,y:-.7,z:.25,e:'H'},
{x:1.1,y:-.7,z:-.25,e:'H'}
],
bonds:[[0,1],[0,2]]
},
caffeine:{
name:'CAFFEINE',
formula:'C₈H₁₀N₄O₂',
note:'A complex little constellation known for its stimulating effect. Its fused rings make a beautiful molecular map.',
atoms:[
{x:-1,y:0,z:0,e:'C'},
{x:0,y:-.6,z:.2,e:'N'},
{x:1,y:0,z:-.1,e:'C'},
{x:1.5,y:1,z:.3,e:'N'},
{x:.5,y:1.4,z:0,e:'C'},
{x:-.5,y:1,z:-.2,e:'C'},
{x:-1.6,y:1,z:.2,e:'O'},
{x:-1.8,y:-.8,z:-.3,e:'N'},
{x:-.5,y:-1.6,z:.2,e:'C'},
{x:1.7,y:-1,z:0,e:'O'}
],
bonds:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6],[0,7],[7,8],[2,9]]
},
aspirin:{
name:'ASPIRIN',
formula:'C₉H₈O₄',
note:'A familiar compound with an aromatic ring and functional groups — a stellar specimen for structure exploration.',
atoms:[
{x:-1,y:0,z:0,e:'C'},
{x:0,y:-.7,z:.2,e:'C'},
{x:1,y:0,z:-.2,e:'C'},
{x:1,y:1,z:.2,e:'C'},
{x:0,y:1.7,z:-.1,e:'C'},
{x:-1,y:1,z:.2,e:'C'},
{x:-2,y:-.7,z:.2,e:'O'},
{x:-3,y:-.3,z:0,e:'O'},
{x:2,y:-.7,z:.2,e:'O'},
{x:3,y:-1,z:-.2,e:'C'},
{x:3.7,y:-.1,z:.2,e:'O'}
],
bonds:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,7],[2,8],[8,9],[9,10]]
},
benzene:{
name:'BENZENE',
formula:'C₆H₆',
note:'A perfectly symmetrical six-carbon ring. Its delocalized pi electrons give the molecule its signature stability.',
atoms:Array.from({length:6},(_,i)=>({
x:Math.cos(i*Math.PI/3)*1.35,
y:Math.sin(i*Math.PI/3)*1.35,
z:Math.sin(i*2.1)*.3,
e:'C'
})),
bonds:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]
}
};

let current='water',
rotX=-.25,
rotY=.35,
autoSpin=true,
dragging=false,
last={x:0,y:0},
zoom=1;

const colors={
O:'#ff6b8d',
H:'#e2e9ff',
C:'#a58bff',
N:'#6eeaff'
};

function fitCanvas(){
let r=canvas.getBoundingClientRect();
canvas.width=Math.max(1,r.width*devicePixelRatio);
canvas.height=Math.max(1,r.height*devicePixelRatio);
ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)
}

new ResizeObserver(fitCanvas).observe(canvas);
fitCanvas();

function project(atom,scale,cx,cy){
let x=atom.x,y=atom.y,z=atom.z;
let cy1=Math.cos(rotY),sy=Math.sin(rotY);
let cx1=Math.cos(rotX),sx=Math.sin(rotX);

let x1=x*cy1-z*sy;
let z1=x*sy+z*cy1;
let y1=y*cx1-z1*sx;
let z2=y*sx+z1*cx1;

let perspective=4.5/(4.5+z2);

return {
x:cx+x1*scale*perspective,
y:cy+y1*scale*perspective,
z:z2,
r:(atom.e==='O'?16:atom.e==='N'?13:atom.e==='C'?12:8)*perspective,
e:atom.e
}
}

function render(t){
let w=canvas.clientWidth,h=canvas.clientHeight;
ctx.clearRect(0,0,w,h);

if(autoSpin&&!dragging)rotY+=.003;

const data=specimen[current];
const scale=Math.min(w,h)*.105*zoom;
const cx=w/2,cy=h/2;

let points=data.atoms.map(a=>project(a,scale,cx,cy));

// Orbital rings
ctx.save();
ctx.translate(cx,cy);
ctx.rotate(-.28);
ctx.strokeStyle='#8d7ad52b';
ctx.lineWidth=1;
ctx.setLineDash([3,7]);
ctx.beginPath();
ctx.ellipse(0,0,scale*2.2,scale*.82,0,0,Math.PI*2);
ctx.stroke();

ctx.rotate(.72);
ctx.beginPath();
ctx.ellipse(0,0,scale*1.85,scale*.65,0,0,Math.PI*2);
ctx.stroke();
ctx.restore();
ctx.setLineDash([]);

// Bonds
for(const [a,b] of data.bonds){
let p=points[a],q=points[b];

ctx.lineCap='square';
ctx.strokeStyle='#8b7ab9';
ctx.lineWidth=5;
ctx.beginPath();
ctx.moveTo(p.x,p.y);
ctx.lineTo(q.x,q.y);
ctx.stroke();

ctx.strokeStyle='#d6caff';
ctx.lineWidth=1.3;
ctx.beginPath();
ctx.moveTo(p.x,p.y);
ctx.lineTo(q.x,q.y);
ctx.stroke()
}

// Atoms
points.sort((a,b)=>a.z-b.z).forEach(p=>{
ctx.fillStyle=colors[p.e]||'#fff';
ctx.shadowColor=colors[p.e]||'#fff';
ctx.shadowBlur=18;
ctx.beginPath();
ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
ctx.fill();

ctx.shadowBlur=0;
ctx.fillStyle='#ffffff55';
ctx.fillRect(
p.x-p.r*.35,
p.y-p.r*.5,
Math.max(2,p.r*.45),
Math.max(2,p.r*.25)
);

ctx.strokeStyle='#ffffff88';
ctx.lineWidth=1.2;
ctx.stroke();

ctx.fillStyle='#090812';
ctx.font='bold '+Math.max(8,p.r*.8)+'px Space Grotesk';
ctx.textAlign='center';
ctx.textBaseline='middle';
ctx.fillText(p.e,p.x,p.y+.5)
});

document.getElementById('coord-x').textContent=
String(Math.round((rotX*100)%100)).padStart(2,'0');

document.getElementById('coord-y').textContent=
String(Math.round((rotY*100)%100)).padStart(2,'0');

requestAnimationFrame(render)
}

requestAnimationFrame(render);

canvas.addEventListener('pointerdown',e=>{
dragging=true;
last={x:e.clientX,y:e.clientY};
canvas.setPointerCapture(e.pointerId)
});

canvas.addEventListener('pointermove',e=>{
if(!dragging)return;
rotY+=(e.clientX-last.x)*.008;
rotX+=(e.clientY-last.y)*.008;
last={x:e.clientX,y:e.clientY}
});

canvas.addEventListener('pointerup',()=>dragging=false);
canvas.addEventListener('pointercancel',()=>dragging=false);

canvas.addEventListener('wheel',e=>{
e.preventDefault();
zoom=Math.max(.55,Math.min(1.8,zoom-e.deltaY*.001))
},{passive:false});

document.getElementById('spin-toggle').addEventListener('click',()=>{
autoSpin=!autoSpin;
document.getElementById('spin-toggle').textContent=
'⟳ AUTO SPIN: '+(autoSpin?'ON':'OFF')
});

document.getElementById('reset-view').addEventListener('click',()=>{
rotX=-.25;
rotY=.35;
zoom=1
});

function selectMolecule(key){
current=key;
let s=specimen[key];

document.getElementById('mol-name').textContent=s.name;
document.getElementById('mol-formula').textContent=s.formula;
document.getElementById('mol-note').textContent=s.note;

document.querySelectorAll('.molecule-card').forEach(c=>
c.classList.toggle('active',c.dataset.molecule===key)
);

rotX=-.25;
rotY=.35;
zoom=1
}

document.querySelectorAll('.molecule-card').forEach(card=>
card.addEventListener('click',()=>{
selectMolecule(card.dataset.molecule);
document.getElementById('lab').scrollIntoView({
behavior:'smooth',
block:'start'
})
})
);
