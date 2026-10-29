var $=function(s){return document.querySelector(s)};
var best={};try{best=JSON.parse(localStorage.getItem('pa-best')||'{}')}catch(e){}
function saveBest(k,v){best[k]=v;try{localStorage.setItem('pa-best',JSON.stringify(best))}catch(e){}}
var LIST=[
['g2048','🔢','2048','Slide and merge tiles.','linear-gradient(135deg,#00b894,#00cec9)'],
['seq','🧩','Number Sequence','Spot the pattern. 10 puzzles.','linear-gradient(135deg,#0984e3,#74b9ff)'],
['math','➗','Speed Math','60 seconds of mental maths.','linear-gradient(135deg,#e84393,#fd79a8)'],
['pattern','💡','Pattern Memory','Watch, remember, repeat.','linear-gradient(135deg,#fab1a0,#ff7675)'],
['memory','🃏','Memory Match','Find all the pairs.','linear-gradient(135deg,#6c5ce7,#a29bfe)'],
['ttt','❌','Tic-Tac-Toe','Beat the computer or a friend.','linear-gradient(135deg,#ff6b81,#ff9f43)'],
['reaction','⚡','Reaction Test','How fast are you?','linear-gradient(135deg,#fdcb6e,#e17055)']];
var G={},stop=null;
$('#grid').innerHTML=LIST.map(function(g){return '<button class="gcard" data-id="'+g[0]+'"><div class="ic" style="background:'+g[4]+'">'+g[1]+'</div><b>'+g[2]+'</b><span>'+g[3]+'</span></button>'}).join('');
$('#grid').onclick=function(e){var c=e.target.closest('.gcard');if(c)openGame(c.dataset.id)};
function openGame(id){var g=LIST.filter(function(x){return x[0]==id})[0];if(!g)return;if(stop)stop();$('#home').style.display='none';$('#view').style.display='block';$('#gt').textContent=g[1]+' '+g[2];stop=G[id]($('#stage'))||null;if(location.hash!='#'+id)location.hash=id;window.scrollTo(0,0)}
function goHome(){if(stop)stop();stop=null;$('#stage').innerHTML='';$('#view').style.display='none';$('#home').style.display='block';if(location.hash)history.replaceState(null,'',location.pathname+location.search)}
$('#back').onclick=goHome;$('#logo').onclick=goHome;
window.addEventListener('hashchange',function(){var h=location.hash.slice(1);h?openGame(h):goHome()});
$('#theme').onclick=function(){var d=document.documentElement,dark=d.dataset.theme?d.dataset.theme=='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.dataset.theme=dark?'light':'dark'};

/* 2048 */
G.g2048=function(el){
el.innerHTML='<div class="hud"><span>Score <b id="sc">0</b></span><span>Best <b id="bs">'+(best.g2048||0)+'</b></span></div><div class="b2" id="b2"><div class="bg">'+'<i></i>'.repeat(16)+'</div><div class="tw" id="tw"></div></div><div class="msg" id="ms"></div><p class="hint">Arrow keys / WASD or swipe. Merge equal tiles to reach 2048.</p><button class="btn" id="rs">New game</button>';
var tw=$('#tw'),g,sc,over,won;
function col(v){return 'hsl('+(280-Math.log2(v)*24)+',65%,'+(v<8?64:52)+'%)'}
function put(t){t.el.style.transform='translate('+t.c*100+'%,'+t.r*100+'%)'}
function paint(t){t.in.textContent=t.v;t.in.style.background=col(t.v)}
function bump(t){t.in.style.animation='none';void t.in.offsetWidth;t.in.style.animation='bump .18s'}
function spawn(){var e=[];for(var r=0;r<4;r++)for(var c=0;c<4;c++)if(!g[r][c])e.push([r,c]);if(!e.length)return;var p=e[Math.random()*e.length|0],t={v:Math.random()<.9?2:4,r:p[0],c:p[1],m:0};t.el=document.createElement('div');t.el.className='tl';t.in=document.createElement('div');t.in.className='ti';t.el.appendChild(t.in);tw.appendChild(t.el);put(t);paint(t);g[t.r][t.c]=t}
function cell(l,k,dx,dy){return dx==-1?[l,k]:dx==1?[l,3-k]:dy==-1?[k,l]:[3-k,l]}
function stuck(){for(var r=0;r<4;r++)for(var c=0;c<4;c++){var t=g[r][c];if(!t)return false;if(c<3&&g[r][c+1]&&g[r][c+1].v==t.v)return false;if(r<3&&g[r+1][c]&&g[r+1][c].v==t.v)return false}return true}
function move(dx,dy){if(over)return;var moved=false;
for(var l=0;l<4;l++){var w=0,last=null;
for(var k=0;k<4;k++){var p=cell(l,k,dx,dy),t=g[p[0]][p[1]];if(!t)continue;g[p[0]][p[1]]=null;
if(last&&last.v==t.v&&!last.m){last.v*=2;last.m=1;sc+=last.v;t.r=last.r;t.c=last.c;put(t);(function(t){setTimeout(function(){t.el.remove()},160)})(t);paint(last);bump(last);moved=true}
else{var q=cell(l,w,dx,dy);if(t.r!=q[0]||t.c!=q[1])moved=true;t.r=q[0];t.c=q[1];t.m=0;g[q[0]][q[1]]=t;put(t);last=t;w++}}}
if(moved){$('#sc').textContent=sc;if(sc>(best.g2048||0)){saveBest('g2048',sc);$('#bs').textContent=sc}spawn();
if(!won&&g.some(function(r){return r.some(function(t){return t&&t.v>=2048})})){won=1;$('#ms').textContent='🎉 You made 2048! Keep going.'}
if(stuck()){over=true;$('#ms').textContent='Game over · '+sc}}}
function reset(){tw.innerHTML='';g=[[],[],[],[]];for(var r=0;r<4;r++)for(var c=0;c<4;c++)g[r][c]=null;sc=0;over=won=0;$('#sc').textContent=0;$('#ms').textContent='';spawn();spawn()}
function key(e){var m={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]}[e.key];if(m){e.preventDefault();move(m[0],m[1])}}
document.addEventListener('keydown',key);
var b2=$('#b2'),tx,ty;b2.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
b2.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;Math.abs(dx)>Math.abs(dy)?move(dx>0?1:-1,0):move(0,dy>0?1:-1)});
$('#rs').onclick=reset;reset();
return function(){document.removeEventListener('keydown',key)}};

/* SEQUENCE */
G.seq=function(el){
el.innerHTML='<div class="hud"><span>Question <b id="n">1</b>/10</span><span>Score <b id="sc">0</b></span></div><p class="hint">Find the number that comes next.</p><div class="q" id="q"></div><div class="opts" id="op"></div><div class="msg" id="ms"></div>';
var n,sc,ans,lock,tm;
function R(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function gen(){var t=R(0,4),a=[],i,s,d,l=Math.min(n,6);
if(t==0){s=R(1,20);d=R(2,3+l);for(i=0;i<6;i++)a.push(s+d*i)}
else if(t==1){s=R(1,4);d=R(2,3);for(i=0;i<6;i++)a.push(s*Math.pow(d,i))}
else if(t==2){s=R(0,5);for(i=1;i<=6;i++)a.push(i*i+s)}
else if(t==3){a=[R(1,4),R(2,6)];for(i=2;i<6;i++)a.push(a[i-1]+a[i-2])}
else{s=R(1,10);d=R(1,3);a=[s];for(i=1;i<6;i++)a.push(a[i-1]+d*i)}
return a}
function next(){if(n>10){var m=sc>=9?'Brilliant pattern spotter! 🧠':sc>=6?'Sharp thinking 👏':'Good start, try again 💪';$('#q').textContent=sc+' / 10';$('#op').innerHTML='<button style="grid-column:span 2" id="ag">Play again</button>';$('#ms').textContent=m;$('#ag').onclick=init;return}
$('#n').textContent=n;lock=false;$('#ms').textContent='';var a=gen();ans=a[5];$('#q').textContent=a.slice(0,5).join(', ')+', ?';
var o=[ans],m=Math.max(3,Math.round(ans*.15)),v;while(o.length<4){v=ans+R(-m,m);if(v>0&&o.indexOf(v)<0)o.push(v)}
o.sort(function(){return Math.random()-.5});$('#op').innerHTML=o.map(function(x){return '<button data-v="'+x+'">'+x+'</button>'}).join('')}
function init(){n=1;sc=0;$('#sc').textContent=0;next()}
$('#op').onclick=function(e){var b=e.target.closest('button[data-v]');if(!b||lock)return;lock=true;var ok=+b.dataset.v==ans;b.classList.add(ok?'good':'bad');
if(ok){sc++;$('#sc').textContent=sc}else[].forEach.call($('#op').children,function(x){if(+x.dataset.v==ans)x.classList.add('good')});
tm=setTimeout(function(){n++;next()},900)};
init();return function(){clearTimeout(tm)}};

/* SPEED MATH */
G.math=function(el){
el.innerHTML='<div class="hud"><span>Score <b id="sc">0</b></span><span>Best <b id="bs">'+(best.math||0)+'</b></span></div><div class="bar"><i id="br"></i></div><div class="q" id="q">Ready?</div><div class="opts" id="op"></div><div class="msg" id="ms">Solve as many as you can in 60 seconds.</div><button class="btn" id="go">Start</button>';
var sc,left,iv,ans,run;
function R(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function prob(){var l=Math.floor(sc/5),a=R(2,9+l*3),b=R(2,9+l*2),t=R(0,2),q;
if(t==0){ans=a+b;q=a+' + '+b}else if(t==1){if(b>a){var x=a;a=b;b=x}ans=a-b;q=a+' − '+b}else{a=R(2,9+l);b=R(2,9);ans=a*b;q=a+' × '+b}
$('#q').textContent=q+' = ?';var o=[ans],v;while(o.length<4){v=ans+R(-10,10);if(v>=0&&o.indexOf(v)<0)o.push(v)}
o.sort(function(){return Math.random()-.5});$('#op').innerHTML=o.map(function(x){return '<button data-v="'+x+'">'+x+'</button>'}).join('')}
function fin(){clearInterval(iv);run=false;$('#q').textContent='Time! Score '+sc;$('#op').innerHTML='';$('#ms').textContent=sc>(best.math||0)?'🎉 New best!':'Nice work';if(sc>(best.math||0)){saveBest('math',sc);$('#bs').textContent=sc}$('#go').textContent='Play again'}
$('#go').onclick=function(){clearInterval(iv);sc=0;left=60;run=true;$('#sc').textContent=0;$('#ms').textContent='';prob();$('#go').textContent='Restart';
iv=setInterval(function(){left-=.1;$('#br').style.transform='scaleX('+Math.max(0,left/60)+')';if(left<=0)fin()},100)};
$('#op').onclick=function(e){var b=e.target.closest('button[data-v]');if(!b||!run)return;if(+b.dataset.v==ans){sc++;$('#sc').textContent=sc;prob()}else{b.classList.add('bad');left=Math.max(0,left-2)}};
return function(){clearInterval(iv)}};

/* PATTERN MEMORY */
G.pattern=function(el){
el.innerHTML='<div class="hud"><span>Level <b id="lv">0</b></span><span>Best <b id="bs">'+(best.pattern||0)+'</b></span></div><div class="pg" id="pg">'+'<button></button>'.repeat(9)+'</div><div class="msg" id="ms">Watch the pattern, then repeat it.</div><button class="btn" id="go">Start</button>';
var b=el.querySelectorAll('#pg button'),seq,pos,lv,acc,T=[];
function later(f,t){T.push(setTimeout(f,t))}
function flash(i,t){b[i].classList.add('lit');later(function(){b[i].classList.remove('lit')},t)}
function show(){acc=false;pos=0;$('#ms').textContent='Watch…';seq.forEach(function(v,k){later(function(){flash(v,420)},600+k*650)});later(function(){acc=true;$('#ms').textContent='Your turn!'},600+seq.length*650)}
function next(){lv++;$('#lv').textContent=lv;seq.push(Math.random()*9|0);show()}
$('#go').onclick=function(){T.forEach(clearTimeout);seq=[];lv=0;next();$('#go').textContent='Restart'};
$('#pg').onclick=function(e){var t=e.target.closest('button');if(!t||!acc)return;var i=[].indexOf.call(b,t);flash(i,200);
if(i==seq[pos]){pos++;if(pos==seq.length){acc=false;$('#ms').textContent='Nice! ✓';later(next,800)}}
else{acc=false;var r=lv-1;$('#ms').textContent='Oops! You reached level '+r;if(r>(best.pattern||0)){saveBest('pattern',r);$('#bs').textContent=r}}};
return function(){T.forEach(clearTimeout)}};

/* MEMORY */
G.memory=function(el){
el.innerHTML='<div class="hud"><span>Moves <b id="mv">0</b></span><span>Best <b>'+(best.memory||'–')+'</b></span></div><div class="board m" id="bd"></div><div class="msg" id="ms"></div><button class="btn" id="rs">New game</button>';
var E=['🚀','🌈','🍕','🎸','🦊','🐙','⚡','🍩'],open,lock,mv,done;
function init(){var a=E.concat(E).sort(function(){return Math.random()-.5});open=[];lock=false;mv=done=0;$('#mv').textContent=0;$('#ms').textContent='';
$('#bd').innerHTML=a.map(function(e,i){return '<button class="tile" data-e="'+e+'" data-i="'+i+'">'+e+'</button>'}).join('')}
$('#bd').onclick=function(e){var t=e.target.closest('.tile');if(!t||lock||t.classList.contains('on')||t.classList.contains('ok'))return;t.classList.add('on');open.push(t);
if(open.length==2){mv++;$('#mv').textContent=mv;var a=open[0],b=open[1];open=[];
if(a.dataset.e==b.dataset.e){a.classList.add('ok');b.classList.add('ok');if(++done==8){$('#ms').textContent='🎉 Done in '+mv+' moves!';if(!best.memory||mv<best.memory)saveBest('memory',mv)}}
else{lock=true;setTimeout(function(){a.classList.remove('on');b.classList.remove('on');lock=false},750)}}};
$('#rs').onclick=init;init()};

/* TIC-TAC-TOE */
G.ttt=function(el){
el.innerHTML='<div class="seg"><button data-m="cpu" class="act">vs Computer</button><button data-m="two">2 Players</button></div><div class="hud"><span>X <b id="sx">0</b></span><span>Draws <b id="sd">0</b></span><span>O <b id="so">0</b></span></div><div class="board t" id="bd"></div><div class="msg" id="ms"></div><button class="btn" id="rs">New round</button>';
var b,turn,end,mode='cpu',sc={X:0,D:0,O:0},L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function win(b){for(var i=0;i<8;i++){var l=L[i];if(b[l[0]]&&b[l[0]]==b[l[1]]&&b[l[0]]==b[l[2]])return l}return null}
function mm(b,p){var w=win(b);if(w)return{s:b[w[0]]=='O'?1:-1};if(b.every(Boolean))return{s:0};var best=null;
for(var i=0;i<9;i++)if(!b[i]){b[i]=p;var r=mm(b,p=='O'?'X':'O');b[i]='';if(!best||(p=='O'?r.s>best.s:r.s<best.s))best={s:r.s,i:i}}return best}
function render(){$('#bd').innerHTML=b.map(function(v,i){return '<button class="tile '+v+'" data-i="'+i+'">'+v+'</button>'}).join('');
var w=win(b);if(w){w.forEach(function(i){$('#bd').children[i].classList.add('w')});finish(b[w[0]])}else if(b.every(Boolean))finish('D');
else $('#ms').textContent=(mode=='cpu'&&turn=='X'?'Your turn':turn+'’s turn')}
function finish(r){end=true;sc[r]++;$('#sx').textContent=sc.X;$('#sd').textContent=sc.D;$('#so').textContent=sc.O;$('#ms').textContent=r=='D'?'It’s a draw':(mode=='cpu'?(r=='X'?'You win! 🎉':'Computer wins'):r+' wins! 🎉')}
function init(){b=Array(9).fill('');turn='X';end=false;render()}
$('#bd').onclick=function(e){var t=e.target.closest('.tile'),i=t&&+t.dataset.i;if(t==null||end||b[i]||(mode=='cpu'&&turn=='O'))return;b[i]=turn;turn=turn=='X'?'O':'X';render();
if(mode=='cpu'&&!end&&turn=='O')setTimeout(function(){if(end)return;var m=mm(b.slice(),'O');b[m.i]='O';turn='X';render()},350)};
el.querySelector('.seg').onclick=function(e){var t=e.target.closest('button');if(!t)return;mode=t.dataset.m;el.querySelectorAll('.seg button').forEach(function(x){x.classList.toggle('act',x==t)});sc={X:0,D:0,O:0};$('#sx').textContent=$('#sd').textContent=$('#so').textContent=0;init()};
$('#rs').onclick=init;init()};

/* REACTION */
G.reaction=function(el){
el.innerHTML='<div class="hud"><span>Round <b id="rd">1</b>/3</span><span>Best avg <b id="bs">'+(best.react3?best.react3+' ms':'–')+'</b></span></div><div class="react" id="rx"></div><p class="hint">Wait for green, then tap as fast as you can. After 3 rounds you get your average.</p>';
var rx=$('#rx'),st,t0,to,times=[];
function idle(h){st='idle';rx.className='react';rx.innerHTML='<div>'+h+'</div>'}
function reset(){times=[];$('#rd').textContent=1;idle('Tap to start')}
function press(e){e.preventDefault();
if(st=='idle'){st='wait';rx.className='react wait';rx.innerHTML='<div>Wait for green…</div>';to=setTimeout(function(){st='go';rx.className='react go';rx.innerHTML='<div>TAP NOW!</div>';t0=performance.now()},1200+Math.random()*2800)}
else if(st=='wait'){clearTimeout(to);idle('Too soon!<br><small>Tap to retry this round</small>')}
else if(st=='go'){var ms=Math.round(performance.now()-t0);times.push(ms);
if(times.length<3){$('#rd').textContent=times.length+1;idle(ms+' ms<br><small>Tap for round '+(times.length+1)+'</small>')}
else{var a=Math.round(times.reduce(function(p,c){return p+c},0)/3),r=a<220?'Lightning fast ⚡':a<300?'Great reflexes 👏':a<400?'Pretty average 🙂':'Keep practicing 💪';
if(!best.react3||a<best.react3){saveBest('react3',a);$('#bs').textContent=a+' ms'}
st='done';rx.className='react';rx.innerHTML='<div>Average<br><span style="font-size:clamp(34px,10vw,52px)">'+a+' ms</span><br><small>'+times.join(' · ')+' ms<br>'+r+'<br>Tap to play again</small></div>'}}
else reset()}
rx.addEventListener('pointerdown',press);reset();
return function(){clearTimeout(to)}};

if(location.hash.length>1)openGame(location.hash.slice(1));