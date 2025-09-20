import { Player } from '../model/players.js'
const endButton = document.getElementById('endGameBtn')//Boton para finalizar el juego manualmente

function playGame(infoPlayers){
    let endGame = false;
    let turn = 0;
    const maxTurn = infoPlayers.length; //Almacenamos la cantidad de players que se tienen dentro del juego para poder manejar los turnos.
    const dashboard = document.getElementById('tablero');
    function endGameBrokeCondition(infoPlayers){

        const playersBroke = [];
        let endGameCondition = false;

        infoPlayers.forEach(player => {
            if (player.money <= 0 && player.propierties.length === 0){
                playersBroke.push(player);
            }  
        });
        if (playersBroke.length === maxTurn-1){ //Si solo hay un jugador que no este en banca rota, se acaba el juego.
            endGameCondition = true;
        }

        return endGameCondition;
    }

    //Estructura basica del juego
    while (!endGame){
        if (infoPlayers[turn].active){
            //funcion de mostrar los dados y tirarlos
            // funcionTirarDados().then(numDice => { changePosition (numeDice, info) })

            // Funcion para mover al player
            // changePositionPlayer(numDice, infoPlayers[turn], dashboard);

            // let action = {} // Acciones despues de caer sobre una casilla, este metodo debe devolver un objeto con el emetodo a realizar y el valor de agregacion o eliminacion sobre ciertos atributos de las clases.
            
            if (Object.keys(action).length !== 0){ // Esto nos indica que la funcion si nos devolvio instrucciones de cambio para atributos de las clases.
                // Modificar el atributo correspondiente.

                // Funcion de cargar nuevamente la informacion del player.
                // loadPlayersInteface(infoPlayers[turn])
            }
            
        }
        else{
            //Acciones posibles para volver a estar activo
            // Si funciona modificar al player correspondiente.
            
            //Cargamos nuevamente la informacion del player 
            // loadPlayersInteface(infoPlayers[turn])

        }
        turn ++;
        if (turn === maxTurn){
            turn = 0;
        }
    }
}
export function changePositionPlayer(numDados, infoPlayer, tablero){
    
    let posPlayer = infoPlayer.position;
    
    const currentBox = tablero.getElementById(posPlayer);
    const lastToken = currentBox.getElementById(`token-${playerInfo.color}`);
    currentBox.remove(lastToken);

    if (posPlayer + numDados > 43){
        posPlayer -= 43;
    }
    infoPlayer.position = posPlayer;

    const futureBox = tablero.getElementById(posPlayer);

    const tokenPlayer = document.createElement('div');
    tokenPlayer.classList.add('token'); //Dibuja un circulo
    tokenPlayer.id = `token-${infoPlayer.color}`;  //Pinta el circulo
    futureBox.appendChild(tokenPlayer);
    
}
//Esta funcion nos permite inicializar como objetos la informacion de los usuarios que tenemos y almacenarlos en una lista([]).
export function initializePlayersClass(playersList){
    let objectClassList = [];

    objectClassList = playersList.map(item => { //La funcion map nos permite acceder a cada elemento de una lista para rellenar otra, pero si o si por cada item debe haber un return.
        return new Player(item.nickName, item.country, item.color ) //Creamos la instancia de cada player.
    });
    return objectClassList;
}
//Esta funcion nos permite cargar la informacion de cada jugador. Vamos a reutilizarla al detectar cambios a medida que pasa el juego.
export function loadPlayersInteface(objectPlayer){

    if (objectPlayer){

        const gameDiv = document.getElementById('gameDiv');
        
        let divInfoPlayer = document.createElement('div');
        divInfoPlayer.id = `player-${objectPlayer.color}`; //Asignamos el id correspondiente a cada jugar. Esta clase es la que indicara su posicion en la pantalla y las diferencias de colores.
        divInfoPlayer.classList.add('playerInterface'); //Esta es la clase general que genera el recuadro con el mismo tamaño para todos.
        divInfoPlayer.innerHTML = `
            <h2><img src="https://flagsapi.com/${objectPlayer.country.toUpperCase()}/flat/64.png" alt="Bandera-${objectPlayer.country}" class="flag">${objectPlayer.nick_name}</h2>
            <p class="money-text"><strong>Dinero disponible:</strong> ${objectPlayer.money}</p>
            <p class= "properties-text">Propiedades adquiridas:</p>
            <ul>
                
            </ul>

            <p class="h&p-text">Hipotecas y préstamos activos:</p>
            <ul>
            
            </ul>
        `;
        gameDiv.appendChild(divInfoPlayer); //Agregamos cada recuadro a nuestra visualizacion del juego.
    }
}

