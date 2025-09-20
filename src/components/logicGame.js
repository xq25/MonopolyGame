import { Player } from '../model/players.js'
// Estructura para guardar los dueños de propiedades
const propertyOwners = {}; // { 'idPropiedad': 'nombreJugador' }
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
//Esta funcion nos permite inicializar como objetos la informacion de los usuarios que tenemos.
export function initializePlayersClass(playersList){
    let objectClassList = [];

    objectClassList = playersList.map(item => { //La funcion map nos permite acceder a cada elemento de una lista para rellenar otra, pero si o si por cada item debe haber un return.
        return new Player(item.nickName, item.country, item.color ) //Creamos la instancia de cada player.
    });
    return objectClassList;
}
export function loadPlayersInteface(objectListPlayers){

    if (objectListPlayers){

        const gameDiv = document.getElementById('gameDiv');
        objectListPlayers.forEach(playerInfo => {
            let divInfoPlayer = document.createElement('div');
            divInfoPlayer.id = `player-${playerInfo.color}`; //Asignamos el id correspondiente a cada jugar. Esta clase es la que indicara su posicion en la pantalla y las diferencias de colores.
            divInfoPlayer.classList.add('playerInterface'); //Esta es la clase general que genera el recuadro con el mismo tamaño para todos.
            divInfoPlayer.innerHTML = `
                <h2><img src="https://flagsapi.com/${playerInfo.country.toUpperCase()}/flat/64.png" alt="Bandera-${playerInfo.country}" class="flag">${playerInfo.nick_name}</h2>
                <p class="money-text"><strong>Dinero disponible:</strong> ${playerInfo.money}</p>
                <p class= "properties-text">Propiedades adquiridas:</p>
                <ul>
                    
                </ul>

                <p class="h&p-text">Hipotecas y préstamos activos:</p>
                <ul>
                
                </ul>
            `;
            gameDiv.appendChild(divInfoPlayer); //Agregamos cada recuadro a nuestra visualizacion del juego.
        });
    }
}