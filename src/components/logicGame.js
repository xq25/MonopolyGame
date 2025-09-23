import { Player } from '../model/players.js'
import {initCraps} from '../components/craps.js'
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

export function playGame(infoPlayers, tablero){
    let endGame = false;
    let turn = 0;
    const maxTurn = infoPlayers.length;

    initCraps();
    document.addEventListener('diceRolled', (e) => {
        const numDice = e.detail;
        console.log(numDice);
        if (infoPlayers[turn].active){
            changePositionPlayer(numDice, infoPlayers[turn], tablero);
            // Aquí puedes avanzar el turno, mostrar mensajes, etc.
            
            if (turn === maxTurn) turn = 0;
        } else {
            // Acciones para que el usuario esté otra vez activo
        }
    });
    
    
}

function changePositionPlayer(numDados, infoPlayer, tablero){
    // Calcula la nueva posición del jugador
    let posPlayer = infoPlayer.position + numDados;
    if (posPlayer > 40){
        posPlayer -= 40;
    } 

    infoPlayer.position = posPlayer;

    // Busca la casilla correspondiente usando el id generado en tablero.js
    const targetSquare = document.getElementById(`square-${posPlayer}`)
    if (!targetSquare) {
        console.error(`No existe la casilla con id="square-${posPlayer}" en el tablero.`);
        return;
    }

    // Elimina el token anterior si existe
    const oldToken = tablero.querySelector(`#token-${infoPlayer.color}`);
    console.log(oldToken)
    if (oldToken){
        oldToken.remove();
    }

    // Crea y agrega el nuevo token
    const tokenPlayer = document.createElement('div');
    tokenPlayer.classList.add('token');
    tokenPlayer.id = `token-${infoPlayer.color}`;
    targetSquare.appendChild(tokenPlayer);
}

// Función principal que determina qué acción realizar según la casilla
export function eventBox(numDice, currentPlayer, allPlayers) {
  // Buscar la casilla en el DOM
  const casilla = document.getElementById(`square-${numDice}`);// el id del html 
  if (!casilla) {
    console.error(`No existe una casilla con id ${numDice}`);
    return {}; // Si no existe la casilla, devuelve objeto vacío
  }
  
  // Obtener el tipo de casilla (property, chance, etc.)
  const tipo = casilla.getAttribute('data-type');
  let squareData = {}; // Almacenará los datos completos de la casilla

  // Intentar obtener los datos completos de diferentes fuentes
  if (window.MONOPOLY && window.MONOPOLY.squares && window.MONOPOLY.squares[numDice]) {
    // Si existe el objeto global MONOPOLY con datos
    squareData = window.MONOPOLY.squares[numDice];
  } else if (boardData) 
    
  // 1. CASILLAS TIPO PROPIEDAD
  if (tipo === 'property') {
    // Obtener datos básicos de la propiedad
    const price = squareData.price || parseInt(casilla.getAttribute('data-price')) || 0;
    const propertyName = squareData.name || casilla.querySelector('div:last-child')?.textContent || 'Propiedad';
    const propertyColor = squareData.color || casilla.getAttribute('data-color') || '';
    const isMortgaged = propertyOwners[numDice] ? propertyOwners[numDice].mortgaged : false;
    
    // 1.1 Propiedad sin dueño → Opción de comprarla
    if (!propertyOwners[numDice]) {
      return {
        actionType: 'buy-property', // Tipo de acción
        propertyId: numDice,        // ID de la propiedad
        name: propertyName,         // Nombre
        price: price,               // Precio
        color: propertyColor        // Color (grupo)
      };
    } 
    // 1.2 Propiedad hipotecada → No genera renta
    else if (isMortgaged) {
      return {
        actionType: 'mortgaged-property',
        propertyId: numDice,
        name: propertyName,
        ownerId: propertyOwners[numDice].owner
      };
    }
    // 1.3 Propiedad de otro jugador → Pago de renta
    else if (propertyOwners[numDice] !== currentPlayer.getNickName()) {
      const ownerId = propertyOwners[numDice];
      const owner = allPlayers.find(p => p.getNickName() === ownerId);
      
      // Obtener renta base (se puede mejorar para considerar casas/hoteles)
      let rentAmount = squareData.rent?.base || 50;
      
      return {
        actionType: 'pay-rent',
        propertyId: numDice,
        name: propertyName,
        rent: rentAmount,          // Cantidad a pagar
        ownerId: ownerId,          // Dueño que recibe la renta
        ownerColor: owner ? owner.getColor() : 'unknown'
      };
    } 
    // 1.4 Propiedad del propio jugador → Posibilidad de construir
    else {
      return {
        actionType: 'own-property',
        propertyId: numDice,
        name: propertyName,
        canBuild: true // Indica que podría construir (pendiente verificar requisitos)
      };
    }
  }
  
  // 2. CASILLAS TIPO CAJA DE COMUNIDAD
  else if (tipo === 'community_chest') {
    // Obtener cartas disponibles
    let cards = boardData.community_chest || [];
    if (cards.length === 0) {
      // Si no hay cartas definidas, usa una predeterminada
      return {
        actionType: 'community-card',
        description: "Recibes $100 de la banca",
        money: 100
      };
    }
    
    // Seleccionar una carta aleatoria
    const randomIndex = Math.floor(Math.random() * cards.length);
    const card = cards[randomIndex];
    
    return {
      actionType: 'community-card',
      description: card.description || "Carta de comunidad",
      money: card.action && card.action.money ? card.action.money : 0
    };
  }
  
  // 3. CASILLAS TIPO SUERTE
  else if (tipo === 'chance') {
    // Similar a la caja de comunidad
    let cards = boardData.chance || [];
    if (cards.length === 0) {
      return {
        actionType: 'chance-card',
        description: "Pagas $50 de multa",
        money: -50
      };
    }
    
    const randomIndex = Math.floor(Math.random() * cards.length);
    const card = cards[randomIndex];
    
    return {
      actionType: 'chance-card',
      description: card.description || "Carta de suerte",
      money: card.action && card.action.money ? card.action.money : 0
    };
  }
  
  // 4. CASILLAS ESPECIALES (Salida, Cárcel, etc.)
  else if (tipo === 'special') {
    switch (numDice) {
      case '0': // Casilla de Salida
        return {
          actionType: 'go',
          bonus: 200 // Bonus por pasar por la casilla de salida
        };
      case '10': // Visita a la cárcel
        return {
          actionType: 'jail-visit' // Solo visita, sin consecuencias
        };
      case '20': // Parqueo gratis
        return {
          actionType: 'free-parking' // Sin efecto en reglas básicas
        };
      case '30': // Ir a la cárcel
        return {
          actionType: 'go-to-jail',
          destination: 10 // Posición de la cárcel
        };
      default:
        return {}; // Otras casillas especiales sin acción definida
    }
  }
  
  // 5. CASILLAS DE IMPUESTOS
  else if (tipo === 'tax') {
    let amount = 0;
    
    // Obtener cantidad de impuesto
    if (squareData.action && squareData.action.money) {
      amount = Math.abs(squareData.action.money);
    } else {
      // Valores predeterminados según ID de la casilla
      switch (numDice) {
        case "4": amount = 200; break; // Impuesto sobre ingresos
        case "38": amount = 100; break; // Impuesto de lujo
        default: amount = 50; // Valor genérico
      }
    }
    
    return {
      actionType: 'pay-tax',
      amount: amount, // Cantidad a pagar
      name: squareData.name || 'Impuesto'
    };
  }
  
  // 6. CASILLAS DE FERROCARRILES
  else if (tipo === 'railroad') {
    const price = squareData.price || parseInt(casilla.getAttribute('data-price')) || 200;
    const railroadName = squareData.name || casilla.querySelector('div:last-child')?.textContent || 'Ferrocarril';
    const isMortgaged = propertyOwners[numDice] ? propertyOwners[numDice].mortgaged : false;
    
    // 6.1 Ferrocarril sin dueño - opción de comprar
    if (!propertyOwners[numDice]) {
      return {
        actionType: 'buy-railroad',
        railroadId: numDice,
        name: railroadName,
        price: price
      };
    } 
    // 6.2 Ferrocarril hipotecado - sin renta
    else if (isMortgaged) {
      return {
        actionType: 'mortgaged-railroad',
        railroadId: numDice,
        name: railroadName
      };
    }
    // 6.3 Ferrocarril de otro jugador - pagar renta
    else if (propertyOwners[numDice] !== currentPlayer.getNickName()) {
      const ownerId = propertyOwners[numDice];
      const owner = allPlayers.find(p => p.getNickName() === ownerId);
      
      // Contar cuántos ferrocarriles tiene el dueño
      const ownedRailroads = Object.keys(propertyOwners).filter(id => {
        const squareEl = document.getElementById(id);
        return propertyOwners[id] === ownerId && 
               squareEl?.getAttribute('data-type') === 'railroad';
      }).length;
      
      // Calcular renta: 25, 50, 100, 200 según cuántos ferrocarriles tenga
      const rentAmount = 25 * Math.pow(2, ownedRailroads - 1);
      
      return {
        actionType: 'pay-railroad-rent',
        railroadId: numDice,
        name: railroadName,
        rent: rentAmount,
        ownerId: ownerId,
        ownerColor: owner ? owner.getColor() : 'unknown'
      };
    }
    // 6.4 Ferrocarril propio
    else {
      return {
        actionType: 'own-railroad',
        railroadId: numDice,
        name: railroadName
      };
    }
  }
  // Para cualquier otro tipo de casilla o caso no contemplado
  return {}; // Devuelve un objeto vacío - no hay acción
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
