// BOMBSKUY - playable prototype (single file)
// No ES6 modules. Place this file as js/game.js

// ============ Constants ============
var TILE = 40;
var COLS = 25;   // 25 * 40 = 1000
var ROWS = 15;   // 15 * 40 = 600

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

// ============ State ============
var state = {
  running: false,
  paused: false,
  playerName: '',
  difficulty: 'easy',
  timer: 0,
  player: null,
  dogs: [],
  stoneWalls: [], // fixed walls
  brickWalls: [],
  items: [], // {x,y,type}
  bombs: [], // {x,y,timer,power}
  explosions: [], // {x,y,timer}
  stats: { wallsDestroyed:0, tntCollected:0, iceCollected:0 },
  lastTick: 0
};

// ============ DOM refs ============
var overlayWelcome = document.getElementById('overlayWelcome');
var overlayInstr = document.getElementById('overlayInstr');
var overlayDiff = document.getElementById('overlayDiff');
var overlayCount = document.getElementById('overlayCount');
var overlayPause = document.getElementById('overlayPause');
var overlayEnd = document.getElementById('overlayEnd');
var overlayLB = document.getElementById('overlayLB');

var playBtn = document.getElementById('playBtn');
var playerNameIn = document.getElementById('playerName');
var instrBtn = document.getElementById('instrBtn');
var closeInstr = document.getElementById('closeInstr');
var diffBtns = document.querySelectorAll('.diffBtn');
var countTxt = document.getElementById('countTxt');

var nameDisplay = document.getElementById('nameDisplay');
var livesDisplay = document.getElementById('livesDisplay');
var timerDisplay = document.getElementById('timerDisplay');
var statsDisplay = document.getElementById('statsDisplay');

var continueBtn = document.getElementById('continueBtn');
var saveScoreBtn = document.getElementById('saveScoreBtn');
var showLeaderboardBtn = document.getElementById('showLeaderboardBtn');
var restartBtn = document.getElementById('restartBtn');
var lbList = document.getElementById('lbList');
var closeLB = document.getElementById('closeLB');
var overlayCountEl = document.getElementById('overlayCount');
var overlayEndTitle = document.getElementById('endTitle');
var overlayEndStats = document.getElementById('endStats');

// ============ Helpers ============
function gridToPx(x){ return x * TILE; }
function pxToGrid(px){ return Math.floor(px / TILE); }
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function cellEq(a,b){ return a.x===b.x && a.y===b.y; }

// ============ Map: stone wall layout (sample pattern similar to Bomberman)
// You MUST follow module map in final submission — this is a sample layout.
function initStoneWalls(){
  state.stoneWalls = [];
  for(var y=0;y<ROWS;y++){
    for(var x=0;x<COLS;x++){
      // border
      if(x===0||y===0||x===COLS-1||y===ROWS-1){
        state.stoneWalls.push({x:x,y:y});
        continue;
      }
      // regular pattern (every 2 tiles)
      if(x%2===0 && y%2===0){
        state.stoneWalls.push({x:x,y:y});
      }
    }
  }
  // keep player start area clear (top-left)
  // we'll later ensure brick walls don't spawn on stone or reserved positions
}

// ============ Brick walls (random) ============
function spawnBrickWalls(count){
  state.brickWalls = [];
  var tries=0;
  while(state.brickWalls.length < count && tries < 5000){
    tries++;
    var x = randInt(1,COLS-2);
    var y = randInt(1,ROWS-2);
    // avoid stone walls and reserved player/dog start positions
    if(isStoneWall(x,y)) continue;
    if(cellReservedForStart(x,y)) continue;
    if(brickAt(x,y)) continue;
    // place
    var maybeItem = Math.random() < 0.14 ? ['broken','tnt','ice'][randInt(0,2)] : null;
    state.brickWalls.push({x:x,y:y,item:maybeItem});
  }
}
function brickAt(x,y){ return state.brickWalls.some(function(b){return b.x===x && b.y===y}); }
function isStoneWall(x,y){ return state.stoneWalls.some(function(s){return s.x===x && s.y===y}); }
function isWallAt(x,y){ return isStoneWall(x,y) || brickAt(x,y); }
function removeBrick(x,y){
  for(var i=0;i<state.brickWalls.length;i++){
    if(state.brickWalls[i].x===x && state.brickWalls[i].y===y){
      var item = state.brickWalls[i].item;
      state.brickWalls.splice(i,1);
      state.stats.wallsDestroyed++;
      if(item) {
        state.items.push({x:x,y:y,type:item});
      }
      return;
    }
  }
}

// reserved positions: player start (1,1) and a few around it
function cellReservedForStart(x,y){
  var reserved = [{x:1,y:1},{x:1,y:2},{x:2,y:1}];
  for(var i=0;i<state.dogs.length;i++){
    reserved.push({x:COLS-2,y:ROWS-2 - i}); // dog spawns bottom-right variants
  }
  for(var i=0;i<reserved.length;i++){
    if(reserved[i].x===x && reserved[i].y===y) return true;
  }
  return false;
}

// ============ Player ============
function createPlayer(){
  state.player = {
    x:1,y:1,
    hp:3,
    tntPower:1,
    frozen:0,
    invuln:0,
    moving:false,
    moveFrom:null,
    moveTo:null,
    moveProgress:0
  };
  state.stats = {wallsDestroyed:0, tntCollected:0, iceCollected:0};
}
function playerMoveTo(nx,ny){
  if(state.player.moving) return;
  state.player.moving = true;
  state.player.moveFrom = {x:state.player.x,y:state.player.y};
  state.player.moveTo = {x:nx,y:ny};
  state.player.moveProgress = 0;
}
function isCellWalkable(x,y){
  if(x<0||x>=COLS||y<0||y>=ROWS) return false;
  if(isStoneWall(x,y)) return false;
  if(brickAt(x,y)) return false;
  return true;
}

// ============ Dogs (enemies) ============
function spawnDogs(count){
  state.dogs = [];
  // spawn near bottom-right in different offsets
  for(var i=0;i<count;i++){
    var pos = {x:COLS-2 - i, y: ROWS-2 - i};
    // ensure not on stone
    if(isStoneWall(pos.x,pos.y)){
      // find nearest free
      for(var yy=ROWS-2; yy>1; yy--){
        for(var xx=COLS-2; xx>1; xx--){
          if(isCellWalkable(xx,yy) && !dogAt(xx,yy)){
            pos = {x:xx,y:yy}; break;
          }
        }
      }
    }
    state.dogs.push({x:pos.x,y:pos.y, moving:false, moveFrom:null, moveTo:null, moveProgress:0, alive:true, stepCooldown:0});
  }
}
function dogAt(x,y){ return state.dogs.some(function(d){return d.x===x && d.y===y && d.alive}); }

// simple tile-based dog AI chase
function updateDog(d,dt){
  if(!d.alive) return;
  if(d.stepCooldown > 0){ d.stepCooldown -= dt; }
  if(d.moving){
    d.moveProgress += dt * 6; // speed control
    if(d.moveProgress >= 1){
      d.moving = false;
      d.x = d.moveTo.x; d.y = d.moveTo.y;
      d.moveFrom = d.moveTo = null; d.moveProgress = 0;
    }
    return;
  }
  if(d.stepCooldown > 0) return;
  // choose direction towards player
  var dx = state.player.x - d.x;
  var dy = state.player.y - d.y;
  var dirs = [];
  if(Math.abs(dx) > Math.abs(dy)){
    dirs.push(dx>0? [1,0]:[-1,0]);
    dirs.push(dy>0? [0,1]:[0,-1]);
  } else {
    dirs.push(dy>0? [0,1]:[0,-1]);
    dirs.push(dx>0? [1,0]:[-1,0]);
  }
  dirs.push([1,0],[ -1,0],[0,1],[0,-1]);
  for(var i=0;i<dirs.length;i++){
    var nx = d.x + dirs[i][0], ny = d.y + dirs[i][1];
    if(isCellWalkable(nx,ny) && !dogAt(nx,ny) && !(nx===state.player.x && ny===state.player.y)){
      // move
      d.moving = true; d.moveFrom = {x:d.x,y:d.y}; d.moveTo = {x:nx,y:ny}; d.moveProgress = 0; d.stepCooldown = 0.08;
      return;
    }
  }
  // random fallback
  var r = [[1,0],[-1,0],[0,1],[0,-1]][randInt(0,3)];
  var nx = d.x + r[0], ny = d.y + r[1];
  if(isCellWalkable(nx,ny) && !dogAt(nx,ny)){
    d.moving = true; d.moveFrom = {x:d.x,y:d.y}; d.moveTo = {x:nx,y:ny}; d.moveProgress = 0; d.stepCooldown = 0.12;
  }
}

// ============ Bombs & Explosions ============
function placeBomb(x,y){
  // don't place if exists
  if(state.bombs.some(function(b){return b.x===x && b.y===y})) return;
  state.bombs.push({x:x,y:y,timer:5.0,power:state.player.tntPower});
}
function updateBombs(dt){
  for(var i=state.bombs.length-1;i>=0;i--){
    var b = state.bombs[i];
    b.timer -= dt;
    if(b.timer <= 0){
      explodeBomb(b);
      state.bombs.splice(i,1);
    }
  }
}
function explodeBomb(b){
  createExplosion(b.x,b.y);
  var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  for(var di=0;di<dirs.length;di++){
    var d = dirs[di];
    for(var step=1; step<=b.power; step++){
      var tx = b.x + d[0]*step, ty = b.y + d[1]*step;
      if(tx<0||tx>=COLS||ty<0||ty>=ROWS) break;
      if(isStoneWall(tx,ty)){ break; }
      createExplosion(tx,ty);
      if(brickAt(tx,ty)){
        // destroy brick and spawn item if any
        // note: destroy stops further propagation
        removeBrick(tx,ty);
        break;
      }
    }
  }
}
function createExplosion(x,y){
  state.explosions.push({x:x,y:y,timer:0.5});
  // apply damage: player
  if(Math.abs(state.player.x - x)===0 && Math.abs(state.player.y - y)===0){
    hurtPlayer();
  }
  // dogs
  for(var i=0;i<state.dogs.length;i++){
    var d = state.dogs[i];
    if(d.alive && d.x===x && d.y===y){
      d.alive = false;
    }
  }
}
function updateExplosions(dt){
  for(var i=state.explosions.length-1;i>=0;i--){
    state.explosions[i].timer -= dt;
    if(state.explosions[i].timer <= 0) state.explosions.splice(i,1);
  }
}

// damage with small invuln
function hurtPlayer(){
  if(state.player.invuln > 0) return;
  state.player.hp = Math.max(0, state.player.hp - 1);
  state.player.invuln = 1.0; // 1 second invuln
}

// ============ Items ============
function pickupItemAt(x,y){
  for(var i=0;i<state.items.length;i++){
    var it = state.items[i];
    if(it.x===x && it.y===y){
      if(it.type === 'broken'){
        state.player.hp = Math.max(0, state.player.hp - 1);
      } else if(it.type === 'tnt'){
        state.player.tntPower++;
        state.stats.tntCollected++;
      } else if(it.type === 'ice'){
        state.player.frozen = 5.0;
        state.stats.iceCollected++;
      }
      state.items.splice(i,1);
      return;
    }
  }
}


var keys = {};
window.addEventListener('keydown', function(e){
  keys[e.key.toLowerCase()] = true;
  // place bomb on space
  if(e.code === 'Space' && state.running && !state.paused){
    placeBomb(state.player.x, state.player.y);
    e.preventDefault();
  }
  if(e.key === 'Escape'){
    if(state.running){
      togglePause();
    }
  }
});
window.addEventListener('keyup', function(e){
  keys[e.key.toLowerCase()] = false;
});

function updatePlayer(dt){
  // update frozen & invuln
  if(state.player.frozen > 0) state.player.frozen -= dt;
  if(state.player.invuln > 0) state.player.invuln -= dt;

  // handle moving animation
  if(state.player.moving){
    state.player.moveProgress += dt * 6; // movement speed
    if(state.player.moveProgress >= 1){
      state.player.x = state.player.moveTo.x; state.player.y = state.player.moveTo.y;
      state.player.moving = false; state.player.moveFrom = state.player.moveTo = null; state.player.moveProgress = 0;
      // after finishing move, check pickups
      pickupItemAt(state.player.x, state.player.y);
      // if dog present -> hurt
      for(var i=0;i<state.dogs.length;i++){
        var d = state.dogs[i];
        if(d.alive && d.x===state.player.x && d.y===state.player.y){
          hurtPlayer();
        }
      }
    }
    return;
  }
  if(state.player.frozen>0) return;
  var nx = state.player.x, ny = state.player.y;
  if(keys['w']||keys['arrowup']) ny--;
  else if(keys['s']||keys['arrowdown']) ny++;
  else if(keys['a']||keys['arrowleft']) nx--;
  else if(keys['d']||keys['arrowright']) nx++;
  if(nx!==state.player.x || ny!==state.player.y){
    if(isCellWalkable(nx,ny) && !dogAt(nx,ny)){
      playerMoveTo(nx,ny);
    } else {
      // if brick or dog -> if dog, hurt
      if(dogAt(nx,ny)){
        hurtPlayer();
      }
    }
  }
}

// ============ Game loop ============
function update(dt){
  if(!state.running || state.paused) return;
  state.timer += dt;
  // update player
  updatePlayer(dt);
  // update dogs
  for(var i=0;i<state.dogs.length;i++){
    updateDog(state.dogs[i],dt);
  }
  // update bombs & explosions
  updateBombs(dt);
  updateExplosions(dt);
  // check collision: if player stepped onto dog tile
  for(var i=0;i<state.dogs.length;i++){
    var d = state.dogs[i];
    if(d.alive && !d.moving && d.x===state.player.x && d.y===state.player.y){
      hurtPlayer();
    }
  }
  // HUD update
  renderHUD();
  // win/lose check
  checkWinLose();
}
function render(){
  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw background grid for clarity
  for(var y=0;y<ROWS;y++){
    for(var x=0;x<COLS;x++){
      ctx.fillStyle = '#072330';
      ctx.fillRect(x*TILE, y*TILE, TILE-1, TILE-1);
    }
  }
  // draw stone walls
  state.stoneWalls.forEach(function(s){
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(s.x*TILE, s.y*TILE, TILE, TILE);
    // stone pattern
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(s.x*TILE+6, s.y*TILE+6, TILE-12, TILE-12);
  });
  // draw brick walls
  state.brickWalls.forEach(function(b){
    ctx.fillStyle = '#8a4b2b';
    ctx.fillRect(b.x*TILE, b.y*TILE, TILE, TILE);
    ctx.fillStyle = '#a8653f';
    ctx.fillRect(b.x*TILE+4, b.y*TILE+4, TILE-8, TILE-8);
  });
  // items
  state.items.forEach(function(it){
    if(it.type==='broken'){ ctx.fillStyle='#8b0000'; }
    else if(it.type==='tnt'){ ctx.fillStyle='#ff8800'; }
    else if(it.type==='ice'){ ctx.fillStyle='#88ddff'; }
    ctx.fillRect(it.x*TILE + TILE*0.25, it.y*TILE + TILE*0.25, TILE*0.5, TILE*0.5);
  });
  // bombs
  state.bombs.forEach(function(b){
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(b.x*TILE + TILE/2, b.y*TILE + TILE/2, TILE*0.28, 0, Math.PI*2);
    ctx.fill();
    // timer text
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(Math.ceil(b.timer), b.x*TILE + 10, b.y*TILE + 18);
  });
  // explosions
  state.explosions.forEach(function(e){
    var alpha = Math.max(0, Math.min(1, e.timer/0.5));
    ctx.fillStyle = 'rgba(255,180,0,'+alpha+')';
    ctx.fillRect(e.x*TILE, e.y*TILE, TILE, TILE);
  });
  // dogs
  state.dogs.forEach(function(d){
    if(!d.alive) return;
    var dx = d.moving ? (d.moveFrom.x + (d.moveTo.x - d.moveFrom.x)*d.moveProgress) : d.x;
    var dy = d.moving ? (d.moveFrom.y + (d.moveTo.y - d.moveFrom.y)*d.moveProgress) : d.y;
    ctx.fillStyle = '#ffcc33';
    ctx.fillRect(dx*TILE + 6, dy*TILE + 6, TILE-12, TILE-12);
  });
  // player
  var px = state.player.moving ? (state.player.moveFrom.x + (state.player.moveTo.x - state.player.moveFrom.x)*state.player.moveProgress) : state.player.x;
  var py = state.player.moving ? (state.player.moveFrom.y + (state.player.moveTo.y - state.player.moveFrom.y)*state.player.moveProgress) : state.player.y;
  ctx.fillStyle = state.player.invuln>0 ? 'rgba(200,0,0,0.8)' : '#33ccff';
  ctx.fillRect(px*TILE + 6, py*TILE + 6, TILE-12, TILE-12);
}
function loop(ts){
  if(!state.lastTick) state.lastTick = ts;
  var dt = (ts - state.lastTick) / 1000;
  state.lastTick = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ============ HUD & UI controllers ============
function renderHUD(){
  nameDisplay.innerText = state.playerName || 'Player';
  livesDisplay.innerText = '❤'.repeat(state.player.hp) + ' '.repeat(3 - state.player.hp);
  var mm = Math.floor(state.timer / 60), ss = Math.floor(state.timer % 60);
  timerDisplay.innerText = ('0'+mm).slice(-2) + ':' + ('0'+ss).slice(-2);
  statsDisplay.innerText = 'Walls:' + state.stats.wallsDestroyed + ' TNT:' + state.stats.tntCollected + ' Ice:' + state.stats.iceCollected;
}

// toggle pause
function togglePause(){
  state.paused = !state.paused;
  overlayPause.classList.toggle('hidden', !state.paused);
  // freeze visual but loop continues; update() respects state.paused
}

// check win/lose
function checkWinLose(){
  if(state.player.hp <= 0){
    endGame(false);
    return;
  }
  // win if all dogs dead
  var alive = state.dogs.filter(function(d){return d.alive;}).length;
  if(alive === 0 && state.running){
    endGame(true);
  }
}

// end game
function endGame(won){
  state.running = false;
  overlayEnd.classList.remove('hidden');
  overlayEndTitle.innerText = won ? 'You Win!' : 'Game Over';
  overlayEndStats.innerHTML = '<div>Player: ' + state.playerName + '</div>'
    + '<div>Time: ' + timerDisplay.innerText + '</div>'
    + '<div>Walls destroyed: ' + state.stats.wallsDestroyed + '</div>'
    + '<div>TNT collected: ' + state.stats.tntCollected + '</div>'
    + '<div>Ice obtained: ' + state.stats.iceCollected + '</div>';
}

// ============ Leaderboard (localStorage) ============
function saveScore(){
  var list = JSON.parse(localStorage.getItem('bombskuy_scores') || '[]');
  list.push({
    name: state.playerName,
    time: Math.floor(state.timer),
    wallsDestroyed: state.stats.wallsDestroyed,
    tntCollected: state.stats.tntCollected,
    iceCollected: state.stats.iceCollected,
    date: new Date().toISOString()
  });
  localStorage.setItem('bombskuy_scores', JSON.stringify(list));
  alert('Score saved!');
}
function showLeaderboard(){
  overlayLB.classList.remove('hidden');
  var list = JSON.parse(localStorage.getItem('bombskuy_scores') || '[]');
  // sort by wallsDestroyed, tntCollected, iceCollected
  list.sort(function(a,b){
    if(b.wallsDestroyed !== a.wallsDestroyed) return b.wallsDestroyed - a.wallsDestroyed;
    if(b.tntCollected !== a.tntCollected) return b.tntCollected - a.tntCollected;
    return b.iceCollected - a.iceCollected;
  });
  lbList.innerHTML = '';
  list.forEach(function(it, idx){
    var d = document.createElement('div'); d.className='lbItem';
    d.innerHTML = '<strong>' + (idx+1) + '. ' + it.name + '</strong>'
      + '<div>Walls:' + it.wallsDestroyed + ' TNT:' + it.tntCollected + ' Ice:' + it.iceCollected + '</div>'
      + '<div>Time:' + Math.floor(it.time/60) + ':' + ('0'+(it.time%60)).slice(-2) + '</div>';
    lbList.appendChild(d);
  });
}

// ============ UI wiring ============
playerNameIn.addEventListener('input', function(){
  playBtn.disabled = playerNameIn.value.trim().length === 0;
});
playBtn.addEventListener('click', function(){
  state.playerName = playerNameIn.value.trim() || 'Player';
  overlayWelcome.classList.add('hidden');
  overlayDiff.classList.remove('hidden');
});
instrBtn.addEventListener('click', function(){ overlayInstr.classList.remove('hidden'); });
closeInstr.addEventListener('click', function(){ overlayInstr.classList.add('hidden'); });

diffBtns.forEach(function(b){
  b.addEventListener('click', function(){
    state.difficulty = b.dataset.diff;
    overlayDiff.classList.add('hidden');
    startCountdown(3, function(){ startGame(); });
  });
});

continueBtn.addEventListener('click', function(){ togglePause(); });

saveScoreBtn.addEventListener('click', function(){ saveScore(); });
showLeaderboardBtn.addEventListener('click', function(){ showLeaderboard(); });
restartBtn.addEventListener('click', function(){ location.reload(); });

closeLB.addEventListener('click', function(){ overlayLB.classList.add('hidden'); });

// ============ Countdown & Start ============
function startCountdown(sec, cb){
  overlayCount.classList.remove('hidden');
  var cur = sec;
  countTxt.innerText = cur;
  var t = setInterval(function(){
    cur--; if(cur<=0){ clearInterval(t); overlayCount.classList.add('hidden'); cb(); } else { countTxt.innerText = cur; }
  }, 1000);
}

function startGame(){
  // init map and entities
  initStoneWalls();
  // brick count based on difficulty
  var brickCount = state.difficulty === 'easy' ? 40 : state.difficulty === 'medium' ? 55 : 70;
  spawnBrickWalls(brickCount);
  createPlayer();
  var dogCount = state.difficulty === 'easy' ? 1 : state.difficulty === 'medium' ? 2 : 3;
  spawnDogs(dogCount);
  state.timer = 0; state.running = true; state.paused = false;
  overlayPause.classList.add('hidden');
  overlayEnd.classList.add('hidden');
  overlayLB.classList.add('hidden');
  renderHUD();
}

// ============ Misc / Info ============
/*
 - This prototype uses tile-based movement to simplify bomb propagation.
 - Stone walls are unbreakable (pattern generated here)
 - Brick walls are breakable and may contain items
 - Items: broken (lose life), tnt (increase bomb power), ice (freeze 5s)
 - Bombs: 5 sec timer, explosion spreads 1 tile by default (increase with tnt)
 - Dogs chase player using a greedy heuristic
 - Save scores to localStorage; leaderboard sorted by wallsDestroyed, then TNT, then Ice
*/

// Optional: show path to uploaded module file for reference
console.log('Module spec file path (for reference): /mnt/data/MODULE_CLIENT_SIDE.docx');
