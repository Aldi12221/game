const WIDTH =10;
const HEIGHT =10;

let bom =[];
let ledakan =[];
let map=[];
let player ={
    x:1,
    y:1
}


for(let y=0; y <HEIGHT; y++
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
            for(let b of bom){
                if(b.x===x && b.y === y){
                    cell.style.background ='red'
                }

            }
            for (let L of ledakan){
                if (L.x === x && L.y === y){
                    cell.style.background ='orange'
            
            }}
            
            
            gameElement.appendChild(cell);
        }
        }

}


function createLedakan(x,y){
    ledakan.push({
        x:x,
        y:y,
        timer:5
    })

}
function updateLedakan(){
    for ( let i = ledakan.length -1;i>=0;i--){
        ledakan[i].timer--
        if( ledakan[i].timer <=0){
            ledakan.splice(i,1)}
        }}


function placeBomb(){
    for(let b of bom){
        if(b.x === player.x && b.y ===player.y){
            return;
        }
        
    }
    bom.push({
                x:player.x,
                y:player.y,
                timer:30  

            })
            render();
}
function ledakanBom(x,y){
    createLedakan(x,y);
    if (map[y-1][x]===0)createLedakan(x,y-1)
    if (map[y+1][x]===0)createLedakan(x,y+1)
    if (map[y][x-1]===0)createLedakan(x-1,y)
    if (map[y][x+1]===0)createLedakan(x+1,y)
}



function updateBombs (){
    for ( let i = bom.length -1;i>=0;i--){
        bom[i].timer--
        if( bom[i].timer <=0){
            ledakanBom(bom[i].x,bom[i].y)
            bom.splice(i,1)

        }
    }
}

document.addEventListener('keydown',(e)=>{
    let nx = player.x
    let ny = player.y

    if(e.key === 'w'||e.key=='ArrowUp')ny--;
    if(e.key==='s'||e.key==='ArrowDown')ny++;
    if(e.key==='a'|| e.key==='ArrowLeft')nx--;
    if(e.key==='d'|| e.key ==='ArrowRight')nx++;

    if(map[ny][nx]===0){
        player.x = nx;
        player.y = ny;
        
    }
    if(e.key ===" "|| e.key ==='Enter'){
        placeBomb()
    }

    render();

})
setInterval (()=>{
    updateBombs()
    updateLedakan()
    render()
},100)
 render();