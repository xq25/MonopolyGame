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
export function eventBox(numDice){
      //Logica al caer en las casillas dependiendo del type
  const casilla = document.getElementById(numDice); // debe ir como parametro el resultado de los dados
  // if (!casilla) {
  //   console.error(`No existe una casilla con id ${numDice}`);
  //   return;
  // } Mensaje de deouracion para ber si si entraba el el id correspondiente
  const tipo = casilla.getAttribute('data-type');
  //const nombre = casilla.getName('data-name') (no se si es necesario entrar al nombre)
  //CAJA COMUNIDAD 
  if (tipo === 'community_chest'){//tener cuidado respecto al valor de validacion ya que debe ser el mismo del backend
  // lógica para tomar una carta de comunidad
    
  } else if (tipo === 'chance') {
  // Lógica para carta de suerte
    
  } else if (tipo === 'property') {
    // Lógica para propiedades (comprar, pagar renta, etc.)
    
  }else if (tipo === 'special') {
    if (casilla.id === '20'){
      console.log("PARQUEO GRATISS")
    }
    // Lógica para casillas especiales (salida, cárcel, etc
  }else if(tipo === 'tax'){
    // Logica para quitar dinero por impuestos
    if (casilla.id === "4"){
      console.log("DAS 200 DE IMPUESTOS")//donde van los mensajes en consola debemos acceder al objeto jugador para hacer la accion correspondiente 
      
    }else if (casilla.id === "12"){
      console.log("Das 50 de impuestos")

    }else if (casilla.id === "28"){
      console.log("Das 50 de impuestos")

    }else if (casilla.id === "38"){
      console.log("Das 100 de impuestos")

    }
    //Aqui ya estarian todos los tax hechos 
  }
  else if(tipo === 'railroad'){
    // logica para los ferrocarriles
  }
}