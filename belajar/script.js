const WIDTH =12;
const HEIGHT =12;

let map=[];
let player ={
    x:1,
    y:1
}

for(let y=0;y<HEIGHT;y++
){
    map[y]=[];

    for(let x=0;x<WIDTH;x++){
        
        if((y === 0 || y === HEIGHT-1 || x=== 0||x===WIDTH-1 )||( y===5 && x === 5)){
            map[y][x]=1;
        }else{
            map[y][x]=0
        }

    }
}

function render (){
    const gameElement = document.getElementById('game')
    gameElement.innerHTML = '';

    for (let y = 0; y <HEIGHT; y++){
        for (let x = 0;x<WIDTH; x++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (map[y][x] === 1) {
                cell.classList.add("wall"); 
            }
            if(player.x === x && player.y === y){
                cell.style.background='yellow'
            }
            
            
            gameElement.appendChild(cell);
        }
        }

}
document.addEventListener('keydown',(e)=>{
    let nx = player.x
    let ny = player.y

    if(e.key === 'w'||e.key=='ArrowUp')ny--;
    if(e.key==='s'||e.key==='ArrowDown')ny++;
    if(e.key==='a'|| e.key==='ArrowLeft')nx--;
    if(e.key==='d')nx++;

    if(map[ny][nx]===0){
        player.x = nx;
        player.y = ny;
        
    }else{
        alert('ada tembok');
    }

    render();

})
 render();