// --- 1. INISIALISASI CANVAS DAN KONSTANTA GLOBAL ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gravity = 0.7; // Gaya tarik ke bawah
const canvasWidth = 1024;
const canvasHeight = 576; 

canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Status tombol keyboard yang sedang ditekan
const keys = {
    a: { pressed: false },
    d: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false }
};


// --- 2. DEFINISI KELAS KARAKTER (FIGHTER CLASS) ---
class Fighter {
    constructor({ position, velocity, color = 'red', offset }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.health = 100;
        this.color = color;
        this.isAttacking = false;
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            offset: offset, 
            width: 100,
            height: 50
        };
        this.lastkey; // Untuk menentukan arah karakter
    }

    draw() {
        // Gambar Karakter
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Gambar Attack Box (Kotak Serangan)
        if (this.isAttacking) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(
                this.attackBox.position.x,
                this.attackBox.position.y,
                this.attackBox.width,
                this.attackBox.height
            );
        }
    }

    update() {
        this.draw();

        // Update posisi attack box (selalu mengikuti karakter)
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        // Terapkan Kecepatan pada Posisi
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Terapkan Gravitasi (Cek apakah karakter menyentuh lantai)
        if (this.position.y + this.height + this.velocity.y >= canvasHeight - 96) {
            this.velocity.y = 0; // Berhenti jatuh
            this.position.y = canvasHeight - this.height - 96; // Atur tepat di lantai
        } else {
            this.velocity.y += gravity; // Terus jatuh
        }
    }

    attack() {
        if (this.health <= 0) return; // Tidak bisa menyerang saat kalah
        this.isAttacking = true;
        // Serangan hanya aktif selama 100 milidetik
        setTimeout(() => {
            this.isAttacking = false;
        }, 100); 
    }
}


// --- 3. INISIALISASI PEMAIN DAN MUSUH ---

// Lantai diletakkan 96px dari bawah canvas (asumsi background/lantai)
const floor = canvasHeight - 96; 

const player = new Fighter({
    position: { x: 50, y: 100 },
    velocity: { x: 0, y: 0 },
    color: 'blue',
    offset: { x: 0, y: 0 } // Kotak serangan di kanan badan
});

const enemy = new Fighter({
    position: { x: 800, y: 100 },
    velocity: { x: 0, y: 0 },
    color: 'red',
    offset: { x: -50, y: 0 } // Kotak serangan di kiri badan (offset negatif)
});


// --- 4. FUNGSI BANTUAN: DETEKSI TABRAKAN ---
const isColliding = ({ rectangle1, rectangle2 }) => {
    return (
        // Cek tabrakan di sumbu X dan Y
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    );
};


// --- 5. LOOP GAME UTAMA (ANIMATE) ---
let gameActive = true;

function animate() {
    if (!gameActive) return; // Hentikan loop jika game tidak aktif
    window.requestAnimationFrame(animate);

    // Bersihkan canvas dan gambar background (hitam)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Gambar lantai
    ctx.fillStyle = 'green';
    ctx.fillRect(0, canvasHeight - 96, canvasWidth, 96);


    // Update posisi Karakter
    player.update();
    enemy.update();

    // Reset pergerakan horizontal setiap frame
    player.velocity.x = 0;
    enemy.velocity.x = 0;

    // Logika Pergerakan Pemain 1 (A, D)
    if (keys.a.pressed && player.lastkey === 'a') {
        player.velocity.x = -5;
    } else if (keys.d.pressed && player.lastkey === 'd') {
        player.velocity.x = 5;
    }

    // Logika Pergerakan Pemain 2 (ArrowLeft, ArrowRight)
    if (keys.ArrowLeft.pressed && enemy.lastkey === 'ArrowLeft') {
        enemy.velocity.x = -5;
    } else if (keys.ArrowRight.pressed && enemy.lastkey === 'ArrowRight') {
        enemy.velocity.x = 5;
    }


    // 💥 Deteksi Tabrakan dan Damage 💥
    
    // Serangan Pemain 1 mengenai Musuh
    if (player.isAttacking && isColliding({ rectangle1: player.attackBox, rectangle2: enemy })) {
        player.isAttacking = false; 
        enemy.health -= 20; 
        console.log('Player 1 Hit! Enemy HP:', enemy.health);
    }

    // Serangan Pemain 2 mengenai Pemain 1
    if (enemy.isAttacking && isColliding({ rectangle1: enemy.attackBox, rectangle2: player })) {
        enemy.isAttacking = false; 
        player.health -= 20;
        console.log('Player 2 Hit! Player HP:', player.health);
    }

    // Tampilkan Health Bar (Sangat Sederhana)
    ctx.fillStyle = 'white';
    ctx.fillRect(50, 20, 200, 20); // Background HP Player
    ctx.fillStyle = 'red';
    ctx.fillRect(50, 20, player.health * 2, 20); // HP Player (dikalikan 2 agar lebih lebar)

    ctx.fillStyle = 'white';
    ctx.fillRect(canvasWidth - 250, 20, 200, 20); // Background HP Enemy
    ctx.fillStyle = 'red';
    ctx.fillRect(canvasWidth - 250, 20, enemy.health * 2, 20); // HP Enemy


    // Cek Kondisi Kemenangan/Kekalahan
    if (player.health <= 0 || enemy.health <= 0) {
        determineWinner({ player, enemy, gameActive });
    }
}

// Fungsi untuk menentukan pemenang dan menghentikan game
function determineWinner({ player, enemy, gameActive }) {
    if (gameActive) {
        gameActive = false; // Hentikan loop

        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        
        let message = 'TIE';
        if (player.health === enemy.health) {
             message = 'SERI!';
        } else if (player.health > enemy.health) {
             message = 'PLAYER 1 WIN!';
        } else if (player.health < enemy.health) {
             message = 'PLAYER 2 WIN!';
        }
        
        ctx.fillText(message, canvasWidth / 2, canvasHeight / 2);
    }
}

// Mulai Loop Game
animate();


// --- 6. INPUT KEYBOARD LISTENER ---

// Tombol Ditekan
window.addEventListener('keydown', (event) => {
    if (!gameActive) return; // Abaikan input jika game sudah selesai

    switch (event.key) {
        // Pemain 1 (W, A, D, Spasi)
        case 'd':
            keys.d.pressed = true;
            player.lastkey = 'd';
            break;
        case 'a':
            keys.a.pressed = true;
            player.lastkey = 'a';
            break;
        case 'w': // Lompat
            // Hanya lompat jika sedang di lantai (atau dekat lantai)
            if (player.position.y + player.height >= canvasHeight - 96) {
                player.velocity.y = -20; 
            }
            break;
        case ' ': // Serangan
            player.attack();
            break;

        // Pemain 2 (Panah)
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            enemy.lastkey = 'ArrowRight';
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            enemy.lastkey = 'ArrowLeft';
            break;
        case 'ArrowUp': // Lompat
            if (enemy.position.y + enemy.height >= canvasHeight - 96) {
                enemy.velocity.y = -20;
            }
            break;
        case 'ArrowDown': // Serangan
            enemy.attack();
            break;
    }
});

// Tombol Dilepas
window.addEventListener('keyup', (event) => {
    switch (event.key) {
        // Pemain 1
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;

        // Pemain 2
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
});