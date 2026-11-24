'use strict';

const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
const panel=$('panel'),hud=$('hud'),controls=$('controls'),introVideo=$('intro-video'),music=$('music'),walletDisplay=$('wallet');
const PRICE_STEPS=[100000,150000,200000,250000,350000];
const PLAYER_DEPTH=.78;
const PASS_DESPAWN_DEPTH=PLAYER_DEPTH+.1;
const COIN_ICON='<span class="gold-coin" aria-hidden="true">C</span>';
const TEXT={en:{run:'Run',characters:'Characters',mute:'🔊 Mute music',unmute:'🔇 Unmute music'},tr:{run:'Koş',characters:'Karakterler',mute:'🔊 Müziği kapat',unmute:'🔇 Müziği aç'}};
const CHARACTERS=[
  {id:'james',name:'James · Forest Heart',gender:'prince',price:PRICE_STEPS[0],row:0,col:0,filter:'none',ability:{en:'First flower will not alert the king.',tr:'İlk çiçek kralı yaklaştırmaz.'}},
  {id:'david',name:'David · Stone Shield',gender:'prince',price:PRICE_STEPS[1],row:0,col:1,filter:'hue-rotate(42deg) saturate(.82)',ability:{en:'Blocks one sword or guard hit per run.',tr:'Her koşuda bir kılıç veya gardiyan darbesini engeller.'}},
  {id:'eren',name:'Eren · Wind Trail',gender:'prince',price:PRICE_STEPS[2],row:0,col:2,filter:'sepia(.35) hue-rotate(340deg) saturate(1.15)',ability:{en:'Changes lanes faster.',tr:'Şeritleri daha hızlı değiştirir.'}},
  {id:'lucas',name:'Lucas · Silent Compass',gender:'prince',price:PRICE_STEPS[3],row:0,col:3,filter:'grayscale(.35) hue-rotate(150deg)',ability:{en:'Reveals the safe lane early.',tr:'Güvenli şeridi önceden gösterir.'}},
  {id:'william',name:'William · Daylight',gender:'prince',price:PRICE_STEPS[4],row:0,col:4,filter:'hue-rotate(300deg) saturate(1.25)',ability:{en:'Earns 15% more coins.',tr:'%15 daha fazla coin kazanır.'}},
  {id:'sophia',name:'Sophia · Heart of the Grove',gender:'princess',price:PRICE_STEPS[0],row:1,col:0,filter:'none',ability:{en:'Blocks one dog hit per run.',tr:'Her koşuda bir köpek çarpışmasını engeller.'}},
  {id:'ava',name:'Ava · Quick Step',gender:'princess',price:PRICE_STEPS[1],row:1,col:1,filter:'hue-rotate(35deg)',ability:{en:'Jumps faster and higher; clears swords and guards.',tr:'Daha hızlı ve yükseğe zıplar; kılıç ve gardiyanları aşar.'}},
  {id:'aria',name:'Aria · Sunflower',gender:'princess',price:PRICE_STEPS[2],row:1,col:2,filter:'sepia(.3) saturate(1.2)',ability:{en:'Flowers award 10 bonus coins.',tr:'Çiçeklerden 10 bonus coin kazanır.'}},
  {id:'nora',name:'Nora · Moon Compass',gender:'princess',price:PRICE_STEPS[3],row:1,col:3,filter:'grayscale(.45) hue-rotate(170deg)',ability:{en:'Continue costs 75 coins.',tr:'Devam etme ücreti 75 coindir.'}},
  {id:'olivia',name:'Olivia · Wild Rose',gender:'princess',price:PRICE_STEPS[4],row:1,col:4,filter:'hue-rotate(305deg) saturate(1.2)',ability:{en:'Continue costs 50 coins.',tr:'Devam etme ücreti 50 coindir.'}}
];

let save={coins:0,best:0,owned:['starter'],selected:'starter',muted:false,language:'en'};
try{const old=JSON.parse(localStorage.getItem('stp-v5')||'null');if(old)Object.assign(save,old);else{const v2=JSON.parse(localStorage.getItem('stp-v2')||'{}');save.coins=v2.coins||0}}catch{}
save.coins=Math.max(0,Math.floor(Number(save.coins)||0));save.best=Math.max(0,Math.floor(Number(save.best)||0));save.muted=Boolean(save.muted);save.language=save.language==='tr'?'tr':'en';music.volume=.32;music.muted=save.muted;
if(!Array.isArray(save.owned))save.owned=['starter'];if(!save.owned.includes('starter'))save.owned.unshift('starter');if(!save.owned.includes(save.selected))save.selected='starter';

let state='loading',time=0,intro=0,lane=1,position=1,kingPosition=1,jump=0,travel=0,runCoins=0,threat=0;
let invincible=0,spawn=1,objects=[],offerEnd=0,previous=0,noticeTime=0,clock=0;
let introFadeTimer=0,abilityUsed={},coinBonusBank=0,lucasHint=null;
const images={};
const manifest={bridge:'assets/bridge-v7.jpg',sprites:'assets/characters.png',obstacles:'assets/obstacles-v7.png',guardRun:'assets/guard-run.png',kingRun:'assets/king-run.png',board:'assets/character-board.png'};

function persist(){try{localStorage.setItem('stp-v5',JSON.stringify(save))}catch{}}
function updateWallet(){walletDisplay.innerHTML=COIN_ICON+'<span>'+save.coins.toLocaleString('en-US')+'</span>';walletDisplay.setAttribute('aria-label','Coin wallet: '+save.coins.toLocaleString('en-US'))}
function setChrome(active){hud.style.visibility=active?'visible':'hidden';controls.style.visibility=active?'visible':'hidden'}
function screen(markup,kind=''){panel.className=kind;panel.innerHTML=markup}
function button(label,fn,quiet=false,extra=''){const b=document.createElement('button');b.textContent=label;if(quiet)b.classList.add('quiet');if(extra)b.classList.add(extra);b.onclick=fn;panel.append(b);return b}
function notice(text,seconds=2){$('toast').textContent=text;noticeTime=seconds}
function selectedCharacter(){return CHARACTERS.find(c=>c.id===save.selected)||{id:'starter',gender:'prince',filter:'none',name:'Starter Prince',ability:{en:'No special power.',tr:'Özel yeteneği yok.'}}}
function continueCost(){const id=selectedCharacter().id;return id==='olivia'?50:id==='nora'?75:100}
function awardCoins(amount){const hero=selectedCharacter();let gain=amount;if(hero.id==='william'){coinBonusBank+=amount*.15;const bonus=Math.floor(coinBonusBank);coinBonusBank-=bonus;gain+=bonus}runCoins+=gain;save.coins+=gain;persist();return gain}
function consumeShield(key,message){if(abilityUsed[key])return false;abilityUsed[key]=true;invincible=.8;notice(message,2.2);return true}
function text(key){return TEXT[save.language][key]}
function setLanguage(language){save.language=language;document.documentElement.lang=language;persist();menu()}
function updateMusicButton(){const b=$('music-toggle');if(b)b.textContent=save.muted?text('unmute'):text('mute')}
function startMusic(){music.muted=save.muted;if(!save.muted)music.play().catch(()=>{})}
function toggleMusic(){save.muted=!save.muted;music.muted=save.muted;introVideo.muted=save.muted;persist();if(!save.muted)startMusic();updateMusicButton()}

function menu(){
  document.documentElement.lang=save.language;clearTimeout(introFadeTimer);state='menu';introVideo.pause();introVideo.hidden=true;introVideo.classList.remove('leaving');setChrome(false);$('skip').hidden=true;updateWallet();
  screen('<div class="eyebrow">A ROYAL CHASE THROUGH THE FOREST</div><div class="rule"></div><h1>Saving<br>the Princess</h1><p>Run the suspension bridge. Dodge the guards.<br>Keep the king behind you.</p><div class="menu-actions" id="menu-actions"></div>');
  const actions=$('menu-actions');
  const run=document.createElement('button');run.className='cta';run.textContent=text('run');run.onclick=()=>start(true);actions.append(run);
  const chars=document.createElement('button');chars.className='cta secondary';chars.textContent=text('characters');chars.onclick=shop;actions.append(chars);
  const mute=document.createElement('button');mute.id='music-toggle';mute.className='quiet sound-toggle';mute.onclick=toggleMusic;actions.append(mute);updateMusicButton();
  const languages=document.createElement('div');languages.className='language-picker';for(const [code,label] of [['tr','Türkçe'],['en','English']]){const b=document.createElement('button');b.className='quiet'+(save.language===code?' active':'');b.textContent=label;b.onclick=()=>setLanguage(code);languages.append(b)}actions.append(languages)
}
function start(withIntro=true){
  ensureAudio();startMusic();introVideo.muted=save.muted;
  clearTimeout(introFadeTimer);time=travel=runCoins=threat=invincible=jump=coinBonusBank=0;intro=0;lane=position=kingPosition=1;objects=[];abilityUsed={};lucasHint=null;spawn=1.3;state=withIntro?'intro':'play';panel.classList.add('hidden');setChrome(!withIntro);$('skip').hidden=!withIntro;notice('',0);updateWallet();
  introVideo.pause();introVideo.classList.remove('leaving');introVideo.hidden=!withIntro;
  if(withIntro){introVideo.currentTime=0;const playing=introVideo.play();if(playing)playing.catch(()=>{introVideo.muted=true;introVideo.play().catch(beginRun)})}
}
function beginRun(){
  if(state!=='intro')return;state='play';$('skip').hidden=true;setChrome(false);introVideo.classList.add('leaving');
  clearTimeout(introFadeTimer);introFadeTimer=setTimeout(()=>{introVideo.pause();introVideo.hidden=true;introVideo.classList.remove('leaving');if(state==='play'){setChrome(true);notice('The king is behind you — run!',2.5)}},780)
}
introVideo.addEventListener('ended',beginRun);

function characterCards(gender){
  return CHARACTERS.filter(c=>c.gender===gender).map(c=>{const owned=save.owned.includes(c.id),selected=save.selected===c.id;const action=selected?'Selected':owned?'Select':c.price.toLocaleString('en-US')+' coins';return '<article class="char-card"><canvas class="char-portrait" width="271" height="390" data-id="'+c.id+'"></canvas><div class="char-info"><div class="char-name">'+c.name+'</div><div class="char-price">'+COIN_ICON+' '+c.price.toLocaleString('en-US')+'</div><div class="char-ability">'+c.ability[save.language]+'</div><button data-character="'+c.id+'" '+(selected||(!owned&&save.coins<c.price)?'disabled':'')+'>'+action+'</button></div></article>'}).join('')
}
function shop(){
  ensureAudio();startMusic();updateWallet();
  state='shop';setChrome(false);$('skip').hidden=true;
  screen('<div class="shop-head"><div class="shop-bar"><button class="quiet" id="shop-back">← Back</button><div><div class="eyebrow">CHARACTERS</div><div class="wallet">'+COIN_ICON+' '+save.coins.toLocaleString('en-US')+'</div></div></div></div><h3 class="gender-title">Princes</h3><div class="character-grid">'+characterCards('prince')+'</div><h3 class="gender-title">Princesses</h3><div class="character-grid">'+characterCards('princess')+'</div><h3 class="gender-title">Coin Store</h3><div class="coin-store"><button class="coin-pack" data-pack="10000"><span>'+COIN_ICON+' <strong>10,000</strong> coins</span><span>$0.99</span></button><button class="coin-pack" data-pack="50000"><span>'+COIN_ICON+' <strong>50,000</strong> coins</span><span>$4.99</span></button><button class="coin-pack" data-pack="100000"><span>'+COIN_ICON+' <strong>100,000</strong> coins</span><span>$7.99</span></button></div><p class="store-note" id="store-status">Prototype store — no real charge is made.</p>','shop');
  $('shop-back').onclick=menu;panel.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>chooseCharacter(b.dataset.character));
  panel.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>{$('store-status').textContent='This pack will use Apple In-App Purchase in the App Store version. No charge was made.'});requestAnimationFrame(renderShopPortraits)
}
function chooseCharacter(id){const c=CHARACTERS.find(x=>x.id===id);if(!c)return;if(!save.owned.includes(id)){if(save.coins<c.price)return;save.coins-=c.price;save.owned.push(id)}save.selected=id;persist();shop()}
function renderShopPortraits(){const board=images.board;if(!board)return;const xs=[39,325,612,899,1185],ys=[130,981],sw=271,sh=449;panel.querySelectorAll('.char-portrait').forEach(c=>{const model=CHARACTERS.find(x=>x.id===c.dataset.id);if(!model)return;const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.drawImage(board,xs[model.col],ys[model.row],sw,sh,0,0,c.width,c.height)})}

function finish(){state='end';save.best=Math.max(save.best,Math.floor(travel));persist();updateWallet();setChrome(false);screen('<div class="eyebrow">RUN ENDED</div><h2>The king caught up.</h2><div class="result-score"><span>SCORE: '+Math.floor(travel)+'</span><span>'+COIN_ICON+' '+runCoins+'</span></div><div class="best-score">BEST SCORE: '+save.best+'</div>');button('Run again',()=>start(false),false,'cta');button('Main menu',menu,true)}
function crash(){if(state!=='play'||invincible>0)return;const cost=continueCost();state='offer';offerEnd=performance.now()+5000;setChrome(false);screen('<div class="eyebrow">ONE MORE CHANCE</div><h2>Continue?</h2><div id="countdown">5.0</div><p>'+cost+' coins · Wallet: '+save.coins.toLocaleString('en-US')+'<br>Your collected coins are already saved.</p>');const b=button('Continue · '+cost+' coins',revive);b.disabled=save.coins<cost;if(b.disabled){const p=document.createElement('p');p.textContent='You need '+cost+' coins to continue.';panel.append(p)}button('End run',finish,true)}
function revive(){const cost=continueCost();if(state!=='offer'||performance.now()>=offerEnd||save.coins<cost)return;save.coins-=cost;persist();updateWallet();objects=objects.filter(o=>o.z<.35&&!o.removed);threat=0;invincible=2;spawn=1.3;jump=0;state='play';panel.classList.add('hidden');setChrome(true);notice('Go! 2 seconds of protection.',2)}
function action(a){if(state!=='play')return;if(a==='left')lane=Math.max(0,lane-1);if(a==='right')lane=Math.min(2,lane+1);if(a==='jump'&&jump<=0)jump=selectedCharacter().id==='ava'?.62:.72}
function pause(){if(!['intro','play'].includes(state))return;const before=state;if(before==='intro')introVideo.pause();state='pause';setChrome(false);$('skip').hidden=true;screen('<div class="eyebrow">PAUSED</div><h2>The forest waits.</h2>');button('Continue',()=>{state=before;panel.classList.add('hidden');setChrome(state==='play');$('skip').hidden=state!=='intro';if(state==='intro')introVideo.play().catch(beginRun)});button('Main menu',menu,true)}

$('pause').onclick=pause;$('skip').onclick=beginRun;document.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>action(b.dataset.act));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});window.addEventListener('keydown',e=>{const a={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'jump',' ':'jump'}[e.key];if(a){e.preventDefault();action(a)}if(e.key==='Escape')pause()});
let pointer;canvas.addEventListener('pointerdown',e=>{pointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointerup',e=>{if(!pointer)return;const dx=e.clientX-pointer[0],dy=e.clientY-pointer[1];pointer=null;if(Math.max(Math.abs(dx),Math.abs(dy))<15)return;action(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy<0?'jump':'')});canvas.addEventListener('pointercancel',()=>pointer=null);

let audio;
function ensureAudio(){try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume()}catch{}}
function bark(){try{if(save.muted||!audio||audio.state!=='running')return;for(let i=0;i<2;i++){const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.17;o.type='sawtooth';o.frequency.setValueAtTime(145,t);o.frequency.exponentialRampToValueAtTime(65,t+.1);g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.13)}}catch{}}
document.addEventListener('pointerdown',()=>{ensureAudio();startMusic()},{once:true});

function obstacleType(){const r=Math.random();return r<.25?'guard':r<.45?'dog':r<.7?'sword':'flowers'}
function wave(){
  const first=Math.floor(Math.random()*3),blocked=[first],doubleChance=time<20?0:Math.min(.82,.28+(time-20)*.007);
  if(Math.random()<doubleChance){const choices=[0,1,2].filter(l=>l!==first);blocked.push(choices[Math.floor(Math.random()*choices.length)])}
  for(const l of blocked)objects.push({l,type:obstacleType(),z:0,done:false,phase:Math.random()*5});
  const safeLanes=[0,1,2].filter(l=>!blocked.includes(l)),safe=safeLanes[Math.floor(Math.random()*safeLanes.length)];
  if(selectedCharacter().id==='lucas')lucasHint={lane:safe,until:time+1.35};
  for(let i=0;i<4;i++)objects.push({l:safe,type:'coin',z:-.12-i*.1,done:false,removed:false})
}
function update(dt,now){
  clock+=dt;if(state==='offer'){const remaining=Math.max(0,(offerEnd-now)/1000);if($('countdown'))$('countdown').textContent=remaining.toFixed(1);if(remaining<=0)finish();return}if(state==='intro'){intro=introVideo.currentTime||intro+dt;return}if(state!=='play')return;
  const hero=selectedCharacter(),laneRate=hero.id==='eren'?27:16;time+=dt;travel+=dt*(8+Math.min(time/7,15));jump=Math.max(0,jump-dt);threat=Math.max(0,threat-dt);invincible=Math.max(0,invincible-dt);position+=(lane-position)*Math.min(1,dt*laneRate);kingPosition+=(position-kingPosition)*Math.min(1,dt*6.5);spawn-=dt;if(spawn<=0){wave();spawn=Math.max(.5,1.9-time/80)}const speed=.24+Math.min(.38,time*.0034);
  const objectStep=dt*speed*1.18;for(const o of objects){o.z+=objectStep;if(o.type==='dog'&&o.z>.58&&!o.barked){o.barked=true;bark()}if(o.z>=PLAYER_DEPTH-.01&&!o.done){o.done=true;const hit=Math.abs(position-o.l)<.38;if(!hit)continue;if(o.type==='coin'){o.removed=true;awardCoins(1)}else if(invincible<=0){const airborne=jump>.02;if(hero.id==='ava'&&airborne){o.cleared=true;continue}if(o.type==='guard'||o.type==='sword'){if(hero.id==='david'&&consumeShield('david','Stone Shield blocked the hit!')){o.removed=true;continue}crash();break}if(o.type==='dog'){if(airborne){o.cleared=true;continue}if(hero.id==='sophia'&&consumeShield('sophia','Sophia calmed the hound!')){o.removed=true;continue}crash();break}if(o.type==='flowers'){if(airborne){o.cleared=true;continue}if(hero.id==='aria'){o.removed=true;awardCoins(10);notice('Sunflower power: +10 coins!',2);continue}if(hero.id==='james'&&!abilityUsed.james){abilityUsed.james=true;o.removed=true;notice('Forest Heart ignored the flower!',2);continue}if(threat>0){crash();break}threat=5;notice('The king is closer! Stay clean for 5 seconds.',2.7)}}}}
  objects=objects.filter(o=>!o.removed&&!(o.cleared&&jump<=.1)&&!(o.done&&o.z>PASS_DESPAWN_DEPTH));noticeTime-=dt;if(noticeTime<=0)$('toast').textContent='';$('stats').innerHTML='SCORE: '+Math.floor(travel)+' &nbsp;·&nbsp; '+COIN_ICON+' '+runCoins+(threat>0?' &nbsp;·&nbsp; KING '+threat.toFixed(1):'');updateWallet()
}

function project(l,z){const p=Math.max(0,z);return{x:240+(l-1)*(32+132*p),y:210+420*p,s:.15+1.05*p}}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(x,y,x2,y2,color,w){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()}
function rect(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function cover(img,sx,sy,sw,sh,x,y,w,h,zoom=1){const scale=Math.max(w/sw,h/sh)*zoom;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,sx,sy,sw,sh,x+(w-sw*scale)/2,y+(h-sh*scale)/2,sw*scale,sh*scale);ctx.restore()}
function legacySprite(cell,x,y,height,run=false,filter='none'){const img=images.sprites;if(!img)return;const cw=img.width/4,ch=img.height/2,w=height*cw/ch;ctx.save();ctx.translate(x,y);if(run){ctx.translate(Math.sin(time*16)*2,Math.abs(Math.sin(time*16))*3);ctx.rotate(Math.sin(time*12)*.025)}ctx.filter=filter;ctx.drawImage(img,(cell%4)*cw,Math.floor(cell/4)*ch,cw,ch,-w/2,-height,w,height);ctx.restore()}
function runAtlas(img,frame,x,y,height,filter='none',phase=0){if(!img)return;const cw=img.width/4,ch=img.height,w=height*cw/ch;ctx.save();ctx.translate(x+Math.sin((time+phase)*15)*2,y+Math.abs(Math.sin((time+phase)*15))*4);ctx.rotate(Math.sin((time+phase)*12)*.025);ctx.filter=filter;ctx.drawImage(img,(frame%4)*cw,0,cw,ch,-w/2,-height,w,height);ctx.restore()}
function smoothstep(a,b,value){const x=Math.max(0,Math.min(1,(value-a)/(b-a)));return x*x*(3-2*x)}
function cinematicScene(img,alpha,zoom=1,panX=0,panY=0){if(!img||alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;cover(img,0,0,img.width,img.height,panX-10,panY-10,500,770,zoom);ctx.restore()}
function opening(){
  ctx.fillStyle='#050b0a';ctx.fillRect(0,0,480,750);
  const t=intro;
  const scene1=1-smoothstep(2.35,3.15,t);
  const scene2=smoothstep(2.35,3.15,t)*(1-smoothstep(4.85,5.65,t));
  const scene3=smoothstep(4.85,5.65,t)*(1-smoothstep(7.25,8.05,t));
  const scene4=smoothstep(7.25,8.05,t);
  cinematicScene(images.intro1,scene1,1.015+t*.004,-5+t*.5,0);
  cinematicScene(images.intro2,scene2,1.025+(t-2.4)*.006,3,0);
  cinematicScene(images.intro3,scene3,1.018+(t-5)*.005,Math.sin(t*1.4)*3,0);
  cinematicScene(images.intro4,scene4,1.01+(t-7.4)*.009,0,-2);
  const fadeIn=1-smoothstep(0,.65,t),fadeOut=smoothstep(9.35,10,t);
  ctx.fillStyle='rgba(2,7,6,'+Math.max(fadeIn,fadeOut)+')';ctx.fillRect(0,0,480,750);
  const vignette=ctx.createRadialGradient(240,350,190,240,350,470);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#020807b8');ctx.fillStyle=vignette;ctx.fillRect(0,0,480,750);
  ctx.fillStyle='#050b0a';ctx.fillRect(0,0,480,32);ctx.fillRect(0,718,480,32);rect(40,696,400,3,2,'#8d8467');rect(40,696,400*Math.min(1,t/10),3,2,'#efd78e')
}

function environment(){
  const bg=images.bridge;if(bg)cover(bg,0,0,bg.width,bg.height,0,0,480,750);else{ctx.fillStyle='#23483e';ctx.fillRect(0,0,480,750)}
  const shade=ctx.createLinearGradient(0,0,0,750);shade.addColorStop(0,'#0a261515');shade.addColorStop(.55,'#0000');shade.addColorStop(1,'#0c130d2e');ctx.fillStyle=shade;ctx.fillRect(0,0,480,750)
}
function drawSafeHint(){if(selectedCharacter().id!=='lucas'||!lucasHint||time>=lucasHint.until)return;const remaining=Math.min(1,(lucasHint.until-time)/.35),far=project(lucasHint.lane,.02),near=project(lucasHint.lane,.7),g=ctx.createLinearGradient(0,far.y,0,near.y);g.addColorStop(0,'#aef9d000');g.addColorStop(.45,'#8ff5c755');g.addColorStop(1,'#62e9b722');ctx.save();ctx.globalAlpha=remaining;ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(far.x-12,far.y);ctx.lineTo(far.x+12,far.y);ctx.lineTo(near.x+53,near.y);ctx.lineTo(near.x-53,near.y);ctx.closePath();ctx.fill();ctx.strokeStyle='#caffdfaa';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(far.x,far.y+8);ctx.lineTo(near.x,near.y-6);ctx.stroke();ctx.restore()}
const obstacleRegions={dog:[20,45,455,675],sword:[445,245,655,290],flowers:[1090,105,590,565],coin:[1690,120,350,485]};
function obstacleSprite(type,w,h,y=0){const img=images.obstacles,r=obstacleRegions[type];if(!img||!r)return false;ctx.drawImage(img,r[0],r[1],r[2],r[3],-w/2,y-h,w,h);return true}
function uprightSword(){const img=images.obstacles,r=obstacleRegions.sword;if(!img||!r)return;ctx.save();ctx.translate(0,-62);ctx.rotate(-Math.PI/2);ctx.transform(1,0,-.12,1,0,0);ctx.drawImage(img,r[0],r[1],r[2],r[3],-62,-23,124,46);ctx.restore();ellipse(7,-2,19,6,'#111a164f')}
function drawObject(o){
  if(o.removed)return;const p=project(o.l,o.z);ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.s,p.s);ellipse(0,3,30,8,'#0c1b164f');
  if(o.type==='coin'){ctx.save();ctx.translate(0,-10);ctx.scale(.55+Math.abs(Math.cos(clock*4+o.z))*.45,1);obstacleSprite('coin',48,66,-4);ctx.restore()}
  else if(o.type==='guard')runAtlas(images.guardRun,Math.floor((time+o.phase)*12)%4,0,8,182,'none',o.phase);
  else if(o.type==='dog'){ctx.translate(0,Math.abs(Math.sin((time+o.phase)*15))*3);obstacleSprite('dog',78,112,5)}
  else if(o.type==='sword')uprightSword();
  else obstacleSprite('flowers',96,80,4);ctx.restore()
}
function draw(){
  if(state==='intro'){opening();return}environment();drawSafeHint();for(const o of [...objects].sort((a,b)=>a.z-b.z))if(o.z>=0&&!o.removed)drawObject(o);
  const running=state==='play',model=selectedCharacter(),playerFrame=Math.floor(time*12)%4,p=project(position,PLAYER_DEPTH),jumpDuration=model.id==='ava'?.62:.72,jumpHeight=model.id==='ava'?218:172,lift=jump>0?Math.sin((1-jump/jumpDuration)*Math.PI)*jumpHeight:0;ellipse(p.x,p.y+4,28,9,'#14221c66');ctx.save();if(invincible>0)ctx.globalAlpha=.55+.4*Math.abs(Math.sin(clock*10));if(jump>0)ctx.globalAlpha=Math.max(ctx.globalAlpha,.99);if(model.gender==='princess')legacySprite(4,p.x,p.y+20-lift,164,running,model.filter);else legacySprite(running?playerFrame:0,p.x,p.y+20-lift,164,running,model.filter);ctx.restore();
  if(['play','pause','offer'].includes(state)){const close=threat>0||state==='offer',kingY=close?742:770,kingH=close?178:158,tracked=project(kingPosition,1.02).x,kingX=Math.max(close?92:78,Math.min(close?388:402,tracked));runAtlas(images.kingRun,Math.floor(time*11)%4,kingX,kingY,kingH,'none',.18);if(close){const g=ctx.createLinearGradient(0,590,0,750);g.addColorStop(0,'#762d2500');g.addColorStop(1,'#762d2566');ctx.fillStyle=g;ctx.fillRect(0,590,480,160)}}
}
function frame(now){const elapsed=(now-previous)/1000||0,dt=Math.min(.12,elapsed);previous=now;update(dt,now);draw();requestAnimationFrame(frame)}
Promise.all(Object.entries(manifest).map(([key,url])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve()};im.onerror=()=>resolve();im.src=url}))).then(()=>{menu();if(!images.bridge||!images.sprites||!images.obstacles||!images.kingRun||!images.guardRun)notice('Some game art could not be loaded.',8);requestAnimationFrame(frame)});
