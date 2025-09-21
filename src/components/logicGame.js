import { Player } from '../model/players.js'
// Estructura para guardar los dueños de propiedades
const propertyOwners = {}; // { 'idPropiedad': 'nombreJugador' }
const endButton = document.getElementById('endGameBtn')//Boton para finalizar el juego manualmente
// Variable para acceder a los datos del tablero
let boardData = {};

// Función para recibir los datos del tablero
export function setBoardData(data) {
  boardData = data;
  console.log("Datos del tablero cargados en logicGame.js");
}

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

// Función principal para manejar eventos al caer en casillas
export function eventBox(numDice, currentPlayer, allPlayers) {
  const casilla = document.getElementById(numDice);
  if (!casilla) {
    console.error(`No existe una casilla con id ${numDice}`);
    return;
  }
  const tipo = casilla.getAttribute('data-type');

  // Funciones internas para cada tipo de casilla
  function handleCommunityChest() {
    // Todo tu código para manejar casillas de comunidad...
    alert("¡Caja de comunidad!");
    // Implementa el resto cuando tengas los datos de boardData
  }

  function handleChance() {
    alert("¡Carta de suerte!");
    // Implementa cuando tengas los datos
  }

  function handleProperty() {
    // Obtener precio y color de los atributos data
    const price = parseInt(casilla.getAttribute('data-price'));
    const propertyColor = casilla.getAttribute('data-color');
    
    // Verificar si la propiedad tiene dueño
    if (!propertyOwners[casilla.id]) {
      // No tiene dueño - opción de comprar
      const wantToBuy = confirm(`¿Quieres comprar esta propiedad por $${price}?`);
      if (wantToBuy) {
        if (currentPlayer.getMoney() >= price) {
          currentPlayer.setMoney(currentPlayer.getMoney() - price);
          propertyOwners[casilla.id] = currentPlayer.getNickName();
          
          alert(`¡Has comprado la propiedad!`);
         
        } else {
          alert("No tienes suficiente dinero para comprar esta propiedad.");
        }
      }
    } else if (propertyOwners[casilla.id] !== currentPlayer.getNickName()) {
      // Propiedad de otro jugador - pagar renta
      const owner = allPlayers.find(p => p.getNickName() === propertyOwners[casilla.id]);
      if (owner) {
        // Por ahora usa una renta básica (mejorar después)
        const rent = 50;
        
        currentPlayer.setMoney(currentPlayer.getMoney() - rent);
        owner.setMoney(owner.getMoney() + rent);
        
        alert(`Pagas $${rent} de renta a ${owner.getNickName()}`);
        updatePlayerInterface(currentPlayer);
        updatePlayerInterface(owner);
      }
    } else {
      // Es propiedad del jugador actual
      alert("Esta propiedad es tuya");
    }
  }

  function handleSpecial() {
    // Verificar qué casilla especial es según el id
    switch (casilla.id) {
      case '0': // Salida
        alert("Estás en la casilla de Salida");
        break;
      case '10': // Visita a la cárcel
        alert("Estás visitando la cárcel");
        break;
      case '20': // Parqueo gratis
        alert("¡Parqueo gratis!");
        break;
      case '30': // Ir a la cárcel
        alert("¡Vas a la cárcel!");
        // Mover jugador a la cárcel (id 10)
        currentPlayer.setPosition(10);
        // Si tienes la función para encarcelar:
        if (typeof currentPlayer.setJailed === 'function') {
          currentPlayer.setJailed(true);
        }
        break;
    }
  }

  function handleTax() {
    let amount = 0;
    switch (casilla.id) {
      case "4":
        amount = 200;
        break;
      case "38":
        amount = 100;
        break;
      default:
        amount = 50;
    }
    
    currentPlayer.setMoney(currentPlayer.getMoney() - amount);
    alert(`Pagas $${amount} de impuestos`);
    updatePlayerInterface(currentPlayer);
  }

  // Lógica principal que llama a la función correspondiente
  if (tipo === 'community_chest') {
    handleCommunityChest();
  } else if (tipo === 'chance') {
    handleChance();
  } else if (tipo === 'property') {
    handleProperty();
  } else if (tipo === 'special') {
    handleSpecial();
  } else if (tipo === 'tax') {
    handleTax();
  } else if (tipo === 'railroad') {
    // Maneja los ferrocarriles (similar a propiedad)
    handleProperty(); 
  }
}
// Función para actualizar la interfaz del jugador
function updatePlayerInterface(player) {
  const playerDiv = document.getElementById(`player-${player.getColor()}`);
  if (playerDiv) {
    // Actualizar dinero mostrado
    const moneyText = playerDiv.querySelector('.money-text');
    if (moneyText) {
      moneyText.textContent = `$${player.getMoney()}`;
    }
  }
}

//Esta funcion nos permite inicializar como objetos la informacion de los usuarios que tenemos.
export function initializePlayersClass(playersList){
    let objectClassList = [];

    objectClassList = playersList.map(item => { //La funcion map nos permite acceder a cada elemento de una lista para rellenar otra, pero si o si por cada item debe haber un return.
        return new Player(item.nickName, item.country, item.color ) //Creamos la instancia de cada player.
    });
    return objectClassList;
}
//Esta funcion nos permite cargar la informacion de cada jugador. Vamos a reutilizarla al detectar cambios a medida que pasa el juego.
export function loadPlayerInteface(objectPlayer){

    if (objectPlayer){
        console.log(objectPlayer.country)

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
