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
    invincibleTimer: 0  // Tambah properti untuk kekebalan
};

// Inisialisasi map
for(let y = 0; y < HEIGHT; y++) {
    map[y] = [];
    for(let x = 0; x < WIDTH; x++) {
        if((y === 0 || y === HEIGHT-1 || x === 0 || x === WIDTH-1) || (y === 5 && x === 5)) {
            map[y][x] = 1; // Tembok
        } else if(Math.random() < 0.3) {
            map[y][x] = 2; // Kotak hancur
        } else {
            map[y][x] = 0; // Jalan
        }
    }
}

// Tambah musuh
musuh.push({
    x: 8,
    y: 8,
    dir: 'left'
});

// Fungsi ambil item
function ambilItem() {
    for(let i = items.length - 1; i >= 0; i--) {
        if(items[i].x === player.x && items[i].y === player.y) {
            applyItem(items[i].type);
            items.splice(i, 1);
        }
    }
}

// Fungsi apply item
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

// Fungsi update musuh
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

        // Cek tabrakan dengan player (hanya jika tidak invincible)
        if (e.x === player.x && e.y === player.y && player.invincibleTimer <= 0) {
            player.hp--;
            player.invincibleTimer = 15; // Beri kekebalan 1.5 detik
            updateHud();
            
            if(player.hp <= 0) {
                setTimeout(() => {
                    alert('💀 GAME OVER! Kamu ditabrak musuh!');
                    location.reload();
                }, 300);
            }
        }
    }
    
    // Cek kemenangan
    if(musuh.length === 0) {
        setTimeout(() => {
            alert("🎉 YOU WIN! Semua musuh kalah!");
            location.reload();
        }, 300);
    }
}

// Fungsi render game
function render() {
    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Render tembok
            if (map[y][x] === 1) {
                cell.classList.add("wall"); 
            }
            
            // Render kotak hancur
            if(map[y][x] === 2) {
                cell.style.background = 'brown';
            }
            
            // Render player (berkedip jika invincible)
            if(player.x === x && player.y === y) {
                if(player.invincibleTimer > 0 && Math.floor(Date.now() / 150) % 2 === 0) {
                    cell.style.background = 'white'; // Kedip saat invincible
                } else {
                    cell.style.background = 'yellow'; // Normal
                }
            }
            
            // Render bom
            for(let b of bom) {
                if(b.x === x && b.y === y) {
                    cell.style.background = 'red';
                }
            }
            
            // Render ledakan
            for (let L of ledakan) {
                if (L.x === x && L.y === y) {
                    cell.style.background = 'orange';
                }
            }
            
            // Render items
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
            
            // Render musuh
            for (let m of musuh) {
                if(m.x === x && m.y === y) {
                    cell.style.background = 'green';
                }
            }
            
            gameElement.appendChild(cell);
        }
    }
}

// Fungsi update HUD
function updateHud() {
    document.getElementById('hp').textContent = player.hp;
    document.getElementById('power').textContent = player.power;
    document.getElementById('bomb').textContent = player.maxBombs;
    
    // Update visual invincible timer
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

// Fungsi create ledakan
function createLedakan(x, y) {
    ledakan.push({
        x: x,
        y: y,
        timer: 5,
        alreadyDamagedPlayer: false  // Flag untuk cek apakah sudah beri damage ke player
    });
}

// Fungsi drop item
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

// Fungsi update ledakan (DIPERBAIKI)
function updateLedakan() {
    let playerHit = false;
    
    for (let i = ledakan.length - 1; i >= 0; i--) {
        const ledak = ledakan[i];
        ledak.timer--;

        // Cek tabrakan dengan musuh
        for(let a = musuh.length - 1; a >= 0; a--) {
            if(ledak.x === musuh[a].x && ledak.y === musuh[a].y) {
                musuh.splice(a, 1);
                break;
            }
        }
        
        // Cek tabrakan dengan player (hanya jika tidak invincible dan belum kena ledakan ini)
        if(ledak.x === player.x && ledak.y === player.y && 
           player.invincibleTimer <= 0 && !ledak.alreadyDamagedPlayer) {
            playerHit = true;
            ledak.alreadyDamagedPlayer = true; // Tandai sudah memberikan damage
        }
        
        // Hapus ledakan jika timer habis
        if(ledak.timer <= 0) {
            ledakan.splice(i, 1);
        }
    }
    
    // Jika player kena ledakan, kurangi HP HANYA SEKALI per ledakan
    if(playerHit) {
        player.hp--;
        player.invincibleTimer = 15; // Beri kekebalan 1.5 detik
        updateHud();
        
        // Cek game over
        if(player.hp <= 0) {
            setTimeout(() => {
                alert("💥 GAME OVER! Kamu terkena ledakan!");
                location.reload();
            }, 300);
        }
    }
    
    // Update invincible timer
    if(player.invincibleTimer > 0) {
        player.invincibleTimer--;
    }
}

// Fungsi posisi ledakan
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

// Fungsi place bom
function placebom() {
    // Cek apakah sudah ada bom di posisi player
    for(let b of bom) {
        if(b.x === player.x && b.y === player.y) {
            return;
        }
    }
    
    // Cek batas maksimal bom
    if(bom.length >= (player.maxBombs || 1)) {
        return;
    }
    
    // Tambah bom baru
    bom.push({
        x: player.x,
        y: player.y,
        timer: 30,
        power: player.power
    });
    
    render();
}

// Fungsi ledakan bom
function ledakanBom(b) {
    createLedakan(b.x, b.y);
    
    // Ledakan ke kanan
    for (let i = 1; i <= b.power; i++) {
        posisiLedakan(b.x + i, b.y);
    }
    
    // Ledakan ke kiri
    for (let i = 1; i <= b.power; i++) {
        posisiLedakan(b.x - i, b.y);
    }
   
    // Ledakan ke bawah
    for (let i = 1; i <= b.power; i++) {
        posisiLedakan(b.x, b.y + i);
    }
    
    // Ledakan ke atas
    for (let i = 1; i <= b.power; i++) {
        posisiLedakan(b.x, b.y - i);
    }
}

// Fungsi update bom
function updateboms() {
    for (let i = bom.length - 1; i >= 0; i--) {
        bom[i].timer--;
        if(bom[i].timer <= 0) {
            ledakanBom(bom[i]);
            bom.splice(i, 1);
        }
    }
}

// Event listener keyboard
document.addEventListener('keydown', (e) => {
    let nx = player.x;
    let ny = player.y;

    if(e.key === 'w' || e.key === 'ArrowUp') ny--;
    if(e.key === 's' || e.key === 'ArrowDown') ny++;
    if(e.key === 'a' || e.key === 'ArrowLeft') nx--;
    if(e.key === 'd' || e.key === 'ArrowRight') nx++;

    // Gerakan player
    if(map[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
    }
    
    // Place bom
    if(e.key === " " || e.key === 'Enter') {
        placebom();
    }
    
    ambilItem();
    render();
});

// Interval game loop
setInterval(() => {
    updateboms();
    updateLedakan();
    render();
    updateHud();
}, 100);

// Interval musuh
setInterval(() => {
    updateMusuh();
    render();
    updateHud();
}, 1000);

// Inisialisasi pertama
render();
updateHud();