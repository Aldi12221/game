const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let player={
x:50,
y:50,
size:30,
speed:3

}
let keys={}

window.addEventListener('keydown',(e)=>{keys[e.key]=true})
window.addEventListener('keyup',(e)=>{keys[e.key]=false})

function update(){
    if(keys['w']){player.y -=player.speed}
    if(keys['s']){player.y +=player.speed}
    if(keys['a']){player.x -=player.speed}
    if(keys['d']){player.x +=player.speed}
}

function render(){
    ctx.clearRect(0,0,400,400)
    ctx.fillStyle='blue'
    ctx.fillRect(player.x,player.y,player.size,player.size)
}
function gameLoop(){
    update()
    render()
    requestAnimationFrame(gameLoop)
}
gameLoop()

