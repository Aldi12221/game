const WIDTH =10;
const HEIGHT =10;

let bom =[];
let items =[]
let ledakan =[];
let musuh=[]
let map=[];
let player = {
    x: 1,
    y: 1,
    speed: 1,
    power: 1,        
    maxBombs: 1      
};


for(let y=0; y <HEIGHT; y++
){
    map[y]=[];

    for(let x=0;x<WIDTH;x++){
        
        if((y === 0 || y === HEIGHT-1 || x=== 0||x===WIDTH-1 )||( y===5 && x === 5)){
            map[y][x]=1;

        }else if(Math.random() < 0.3 ){
            map[y][x]= 2;

        }else{
            map[y][x]= 0
        }
        
    }
    
}
musuh.push({
    x:8,
    y:8,
    dir:'left' 
})


function ambilItem (){
    for(let i = items.length -1;i>=0;i--){
        if(items[i].x ===player.x && items[i].y ===player.y){
            applyItem(items[i].type)
            items.splice(i,1)
        }
    }
}

function applyItem (type){
    if(type ==='speed'){
        player.speed =(player.speed ||1)+1
    }
    if(type ==='power'){
        player.power++
    }
    if(type ==='flame'){
        player.maxBombs++
    }


}
function updateMusuh (){
    for(let m of musuh){

        let ny =m.y;
        let nx =m.x;
 
        if(m.dir==='left')nx--;
        if(m.dir==='right')nx++;
        if(m.dir==='up')ny--;
        if(m.dir==='down')ny++;

        if(map[ny][nx]!==0){
            let dirs =['left','right','up','down']
            m.dir =dirs[Math.floor(Math.random()* 4)]
            continue;
        }
        m.x=nx;
        m.y=ny;

        if(m.x === player.x && m.y === player.y){
            alert ('Game Over')
            window.location.reload()
            break;
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
            if(map[y][x]===2){
                cell.style.background='brown'
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
            for(let it of items){
                if(it.x === x && it.y === y){
                    if(it.type ==='speed'){
                        cell.style.background ='lightblue'
                    }
                    if(it.type ==='power'){
                        cell.style.background ='purple'
                    }
                    if(it.type ==='flame'){
                        cell.style.background ='orange'
                    }
                }
            }
            for (let m of musuh){
                if(m.x === x && m.y === y){
                    cell.style.background ='green'
                }
            }
            
            
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
function dropItem(x,y){
    if(Math.random() < 0.4){

        let listItem =['speed','power','flame']
        let randomItem=listItem[Math.floor(Math.random()* listItem.length)]
        items.push({
            x:x,
            y:y,
            type:randomItem
        })
    }

}


function updateLedakan(){
    for ( let i = ledakan.length -1;i>=0;i--){
        ledakan[i].timer--

        for(let i= musuh.length -1;i>=0;i--){
            for (let l of ledakan){
                if(l.x === musuh[i].x && l.y === musuh[i].y){
                    musuh.split(i , 1)
                    break;
                }
            }
        }



        if( ledakan[i].timer <=0){
            ledakan.splice(i,1)}
        }}


function posisiLedakan(x,y){
    if(x<0 || y<0|| x>=WIDTH || y>=HEIGHT)return;
    if(map[y][x]===1)return;
    if(map[y][x]===2){
        map[y][x]=0;
        createLedakan (x,y)
        dropItem(x,y)
        return;
    }
    if(map[y][x]===0){
        createLedakan(x,y)
    }

}


function placebom(){
    for(let b of bom){
        if(b.x === player.x && b.y ===player.y){
            return;
        }
        if(bom.length >=(player.maxBombs ||1)){
            return
        }
        
    }
    bom.push({
                x:player.x,
                y:player.y,
                timer:30,
                power:player.power

            })
            render();
}
function ledakanBom(b) {
    createLedakan(b.x, b.y);

    
    for (let i = 1; i <= b.power; i++) {
        posisiLedakan(b.x + i, b.y);
    }
    
    for (let i = 1; i <= b.power; i++) {
        posisiLedakan(b.x - i, b.y);
    }
   
    for (let i = 1; i <= b.power; i++) {
        posisiLedakan(b.x, b.y + i);
    }
    
    for (let i = 1; i <= b.power; i++) {
        posisiLedakan(b.x, b.y - i);
    }
}




function updateboms (){
    for ( let i = bom.length -1;i>=0;i--){
        bom[i].timer--
        if( bom[i].timer <=0){
            ledakanBom(bom[i])
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
        placebom()
    }
    ambilItem()

    render();

})
setInterval (()=>{
    updateboms()
    updateLedakan()
   
    render()
},100)
setInterval(()=>{
    updateMusuh()
    render()

},1000)
 render();

