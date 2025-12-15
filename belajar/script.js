const WIDTH = 10;
const HEIGHT = 10;

let bom = [];
let items = [];
let ledakan = [];
let musuh = [];
let map = [];
let player = {
    x: 1,
    y: 1,
    speed: 1,
    power: 1,
    maxBombs: 1,
    hp: 3,
    invincibleTimer: 0 ,
    invTimer:0
};


for(let y = 0; y < HEIGHT; y++) {
    map[y] = [];
    for(let x = 0; x < WIDTH; x++) {
        if((y === 0 || y === HEIGHT-1 || x === 0 || x === WIDTH-1) || (y === 5 && x === 5)) {
            map[y][x] = 1; 
        } else if(Math.random() < 0.3) {
            map[y][x] = 2; 
        } else {
            map[y][x] = 0;
        }
    }
}


musuh.push(
    { x: 8, y: 8, dir: 'left' },
    { x: 1, y: 8, dir: 'up' },
    { x: 8, y: 1, dir: 'down' }
);


function ambilItem() {
    for(let i = items.length - 1; i >= 0; i--) {
        if(items[i].x === player.x && items[i].y === player.y) {
            applyItem(items[i].type);
            items.splice(i, 1);
        }
    }
}


function applyItem(type) {
    if(type === 'speed') {
        player.speed = (player.speed || 1) + 1;
    }
    if(type === 'power') {
        player.power++;
    }
    if(type === 'flame') {
        player.maxBombs++;
    }
}


function updateMusuh() {
    for (let e of musuh) {
        let dirs = {
            up:    { x: 0,  y: -1 },
            down:  { x: 0,  y: 1 },
            left:  { x: -1, y: 0 },
            right: { x: 1,  y: 0 }
        };

        let move = dirs[e.dir];
        let nx = e.x + move.x;
        let ny = e.y + move.y;

        if (map[ny][nx] === 0) {
            e.x = nx;
            e.y = ny;
        } else {
            let possible = [];
            for (let d in dirs) {
                let dx = e.x + dirs[d].x;
                let dy = e.y + dirs[d].y;
                if (map[dy][dx] === 0) {
                    possible.push(d);
                }
            }
           
            if (possible.length > 0) {
                e.dir = possible[Math.floor(Math.random() * possible.length)];
            }
        }

        
        if (e.x === player.x && e.y === player.y && player.invincibleTimer <= 0) {
            player.hp--;
            player.invincibleTimer = 15; 
            player.invTimer =10
            updateHud();
            
            if(player.hp <= 0) {
                setTimeout(() => {
                    alert('💀 GAME OVER! Kamu ditabrak musuh!');
                    location.reload();
                }, 300);
            }
        }
    }
    
   
    if(musuh.length === 0) {
        setTimeout(() => {
            alert("🎉 YOU WIN! Semua musuh kalah!");
            location.reload();
        }, 300);
    }
}


function render() {
    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
          
            if (map[y][x] === 1) {
                cell.classList.add("wall"); 
            }
            
            
            if(map[y][x] === 2) {
                cell.style.background = 'brown';
            }
            
            
            if(player.x === x && player.y === y) {
                if(player.invincibleTimer > 0 && Math.floor(Date.now() / 150) % 2 === 0) {
                    cell.style.background = 'white'; 
                } else {
                    cell.style.background = 'yellow'; 
                }
            }
            
           
            for(let b of bom) {
                if(b.x === x && b.y === y) {
                    cell.style.background = 'red';
                }
            }
            
            
            for (let L of ledakan) {
                if (L.x === x && L.y === y) {
                   cell.classList.add('explosion');
                }
            }
            
            
            for(let it of items) {
                if(it.x === x && it.y === y) {
                    if(it.type === 'speed') {
                        cell.style.background = 'lightblue';
                    }
                    if(it.type === 'power') {
                        cell.style.background = 'purple';
                    }
                    if(it.type === 'flame') {
                        cell.style.background = 'pink';
                    }
                }
            }
            
        
            for (let m of musuh) {
                if(m.x === x && m.y === y) {
                    cell.style.background = 'green';
                }
            }
            
            gameElement.appendChild(cell);
        }
    }
}


function updateHud() {
    document.getElementById('hp').textContent = player.hp;
    document.getElementById('power').textContent = player.power;
    document.getElementById('bomb').textContent = player.maxBombs;
    
  
    const invincibleElement = document.getElementById('invincible');
    if(invincibleElement) {
        if(player.invincibleTimer > 0) {
            invincibleElement.textContent = '🛡️';
            invincibleElement.style.opacity = '1';
        } else {
            invincibleElement.textContent = '';
            invincibleElement.style.opacity = '0.5';
        }
    }
}


function createLedakan(x, y) {
    ledakan.push({
        x: x,
        y: y,
        timer: 5,
        alreadyDamagedPlayer: false  
    });
}


function dropItem(x, y) {
    if(Math.random() < 0.4) {
        let listItem = ['speed', 'power', 'flame'];
        let randomItem = listItem[Math.floor(Math.random() * listItem.length)];
        items.push({
            x: x,
            y: y,
            type: randomItem
        });
    }
}


function updateLedakan() {
    let playerHit = false;
    
    for (let i = ledakan.length - 1; i >= 0; i--) {
        const ledak = ledakan[i];
        ledak.timer--;

        
        for(let a = musuh.length - 1; a >= 0; a--) {
            if(ledak.x === musuh[a].x && ledak.y === musuh[a].y) {
                musuh.splice(a, 1);
                break;
            }
        }
        
        
        if(ledak.x === player.x && ledak.y === player.y && 
           player.invincibleTimer <= 0 && !ledak.alreadyDamagedPlayer) {
            playerHit = true;
            ledak.alreadyDamagedPlayer = true; 
        }
        
      
        if(ledak.timer <= 0) {
            ledakan.splice(i, 1);
        }
    }
    
   
    if(playerHit) {
        player.hp--;
        player.invincibleTimer = 15; 
        updateHud();
        
     
        if(player.hp <= 0) {
            setTimeout(() => {
                alert("💥 GAME OVER! Kamu terkena ledakan!");
                location.reload();
            }, 300);
        }
    }
    
    
    if(player.invincibleTimer > 0) {
        player.invincibleTimer--;
    }
}


function posisiLedakan(x, y) {
    if(x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
    if(map[y][x] === 1) return;
    
    if(map[y][x] === 2) {
        map[y][x] = 0;
        createLedakan(x, y);
        dropItem(x, y);
        return;
    }
    
    if(map[y][x] === 0) {
        createLedakan(x, y);
    }
}


function placebom() {
    
    for(let b of bom) {
        if(b.x === player.x && b.y === player.y) {
            return;
        }
    }
    
    
    if(bom.length >= (player.maxBombs || 1)) {
        return;
    }
    
   
    bom.push({
        x: player.x,
        y: player.y,
        timer: 30,
        power: player.power
    });
    
    render();
}


function ledakanBom(b) {
    createLedakan(b.x, b.y);
    
   
    for (let i = 1; i <= b.power; i++) {
        let nx=b.x + i
        let ny =b.y
       


        posisiLedakan(nx,ny);
        if(map[nx][ny]===2)break;
        if(map[nx][ny]===1)break;
        
    }
    
   
    for (let i = 1; i <= b.power; i++) {
        let nx =b.x - i
        let ny =b.y
        posisiLedakan(nx,ny);
        if(map[nx][ny]===2)break;
        if(map[nx][ny]===1)break;
    }
   
    
    for (let i = 1; i <= b.power; i++) {
        let nx = b.x
        let ny = b.y +i
        posisiLedakan(nx,ny);
        if(map[nx][ny]===2)break;
        if(map[nx][ny]===1)break;
        
    }
    
   
    for (let i = 1; i <= b.power; i++) {
        let nx = b.x
        let ny = b.y -i
        posisiLedakan(b.x, b.y - i);
        if(map[nx][ny]===2)break;
        if(map[nx][ny]===1)break;
    }
}


function updateboms() {
    for (let i = bom.length - 1; i >= 0; i--) {
        bom[i].timer--;
        if(bom[i].timer <= 0) {
            ledakanBom(bom[i]);
            bom.splice(i, 1);
        }
    }
}

document.addEventListener('keydown', (e) => {
    let nx = player.x;
    let ny = player.y;

    if(e.key === 'w' || e.key === 'ArrowUp') ny--;
    if(e.key === 's' || e.key === 'ArrowDown') ny++;
    if(e.key === 'a' || e.key === 'ArrowLeft') nx--;
    if(e.key === 'd' || e.key === 'ArrowRight') nx++;

    
    if(map[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
    }
    
    
    if(e.key === " " || e.key === 'Enter') {
        placebom();
    }
    
    ambilItem();
    render();
});


setInterval(() => {
    updateboms();
    updateLedakan();
    render();
    updateHud();
}, 100);


setInterval(() => {
    updateMusuh();
    render();
    updateHud();
}, 1000);


render();
updateHud();



