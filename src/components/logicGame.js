import { Player } from '../model/players.js'
const endButton = document.getElementById('endGameBtn')//Boton para finalizar el juego manualmente

function playGame(infoPlayers){
    let endGame = false;
    let turn = 0;
    const maxTurn = infoPlayers.length; //Almacenamos la cantidad de players que se tienen dentro del juego para poder manejar los turnos.

    function endGameForBroke(infoPlayers){
        const playersBroke = []
        let endGameBrokeCondition = false;
        infoPlayers.forEach(player => {
            if (player.money <= 0 && player.propierties.length === 0){
                playersBroke.push(player)
            }  
        });
        if (playersBroke.length === maxTurn-1){ //Si solo hay un jugador que no este en banca rota, se acaba el juego.
            endGameBrokeCondition = true;
        }

        return endGameBrokeCondition;
    }

    //Estructura basica del juego
    while (!endGame){
        if (infoPlayers[turn].active){
            //funcion de mostrar los dados y tirarlos



            //Acciones posibles despues de tirar los dados
            //Modificar al objeto de cada usuario
        }
        else{
            //Acciones posibles para volver a estar activo
        }
        turn ++;
        if (turn === maxTurn){

            turn = 0;
        }
    }
}

function changePositionPlayer(){
    return 
}
function initializePlayersClass(playersList){
    let objectClassList = [];

    objectClassList = playersList.map(item => {new Player(item.nickName, item.country, item.color )})
    return objectClassList;
}