const WIDTH =10;
const HEIGHT =10;

let map=[];

for(let y=0;y<HEIGHT;y++
){
    map[y]=[];

    for(let x=0;x<WIDTH;x++){
        
        if(y===0 || y===HEIGHT-1 || x=== 0||x===WIDTH-1){
            map[y][x]=1;
        }else{
            map[y][x]=0
        }

    }
}

function render (){
    const gameElement = document.getElementById('game')
    gameElement.innerHTML = '';

    for(let y=0;y<HEIGHT;y++){
        for(let x=0;x<WIDTH;x++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (map[y][x] === 1) {
                cell.classList.add("wall"); 
            }
            
            
            gameElement.appendChild(cell);
        }
        }

}
render();