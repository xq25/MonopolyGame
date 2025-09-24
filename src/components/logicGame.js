import { Player } from '../model/players.js'
import {initCraps} from '../components/craps.js'

// Estructura para guardar los dueños de propiedades
const propertyOwners = {}; // { 'idPropiedad': 'nombreJugador' }
const endButton = document.getElementById('endGameBtn')//Boton para finalizar el juego manualmente

// Variable para acceder a los datos del tablero global para  no hacer importaciones  
window.boardData = {};

// Función para recibir los datos del tablero
export function setBoardData(data) {
  boardData = data;
  console.log("Datos del tablero cargados en logicGame.js");
}

export function playGame(infoPlayers, tablero){
  const popup = result?.closest('.crap-section') || result?.parentElement;
  let endGame = false;
  let turn = 0;
  const maxTurn = infoPlayers.length;

  initCraps();
  if(popup){ popup.style.display = "block"; }

  document.addEventListener('mortgagepropertie', (e) => { //estamos a la escucha del evento si se hipoteca una casa para ejecutar la funcion de forma independiente. (Esto lo podemos hacer ya que la propia funcion refresca la interfaz del usuario)
    mortgagepropertie(e.detail[0],e.detail[1]);
  });
  console.log(window.boardData);
  document.addEventListener('unMortgagepropertie', (e) => {

    if (turnValidation(turn, infoPlayers, e.detail[1].color, maxTurn)){
      unMortgagepropertie(e.detail[0], e.detail[1]);
    }
    else{
      alert('No puedes Deshipotecar propiedades fuera de tu turno');
      return;
    }
  });

  document.addEventListener('diceRolled', (e) => { //Cada vez que se lanza el dado corresponde a el turno de un jugador.

    const numDice = e.detail;  //Almacenamos el numero que nos da los dados para asi poder trabajar con el.

    setTimeout(() => {
        if(popup) popup.style.display = "none";
      }, 1500);

    if (infoPlayers[turn].active){ //Verificamos que le jugador en el turno correspondiente este activo.
      changePositionPlayer(numDice, infoPlayers[turn], tablero);  //Modificamos el atributo de posicion del jugador y pintamos su n ueva posicion en el tablero.

      // Espera un pequeño instante antes de procesar la acción. Asi damos tiempo a que se dibuje el usuario en la nueva posicion.
      setTimeout(() => {

        const action = eventBox(infoPlayers[turn].position.toString(), infoPlayers[turn], infoPlayers); // Verificamos que accion tiene el usuario al caer en dicha casilla.
        processAction(action, infoPlayers, turn); //Procesamos dicha accion y modificamos a los elemento y/o atributos implicados.

        // Manejo de los turnos
        if (turn === maxTurn-1){
          turn = 0;
        } else {
          turn++;
        }
      }, 100); 

      
    } 
    
    else {
      // Acciones para que el usuario esté otra vez activo
      if (turn === maxTurn-1){
          turn = 0;
        } else {
          turn++;
        }
    }
    setTimeout(() => {
        if(popup) popup.style.display = "block";
      }, 3000);
  }); 
  
}

function changePositionPlayer(numDados, infoPlayer, tablero){
  // Calcula la nueva posición del jugador
  let posPlayer = infoPlayer.position + numDados;
  if (posPlayer >= 40){
    posPlayer -= 40;
    const goBonus = boardData.bottom.concat(boardData.left, boardData.top, boardData.right)
        .find(tile => tile.id == 0)?.action?.money || 200; // Busca el bono en el JSON
        infoPlayer.setMoney(infoPlayer.getMoney() + goBonus);
        alert(`¡${infoPlayer.getNickName()} pasa por la salida y recibe $${goBonus}!`);
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
function eventBox(numDice, currentPlayer, allPlayers) {

  // Buscar la casilla en el DOM
  const casilla = document.getElementById(`square-${numDice}`);// el id del html 
  if (!casilla) {
    console.error(`No existe una casilla con id ${numDice}`);
    return {}; // Si no existe la casilla, devuelve objeto vacío
  }
  
  // Obtener el tipo de casilla (property, chance, etc.)
  const tipo = casilla.getAttribute('data-type');
  let squareData = {}; // Almacenará los datos completos de la casilla

  squareData = casilla.getAttribute('data-tile-info') ? JSON.parse(casilla.getAttribute('data-tile-info')) : {};

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
    console.log("Cartas de chance disponibles:", cards.map(c => c.description));
    if (cards.length === 0) {
      return {
        actionType: 'chance-card',
        description: "Pagas $50 de multa",
        money: -50
      };
    }
    
    const randomIndex = Math.floor(Math.random() * cards.length);
    const card = cards[randomIndex];
    console.log("Índice aleatorio:", randomIndex);
    
    
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
           bonus: squareData.action?.money || 200 // Usa el valor del JSON o $200 por defecto
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
export function loadPlayerInteface(objectPlayer) {
  if (!objectPlayer) return;

  const gameDiv = document.getElementById('gameDiv');
  // Buscamos si ya existe la interfaz para este jugador
  let divInfoPlayer = document.getElementById(`player-${objectPlayer.color}`);

  // Construimos las options del select a partir de objectPlayer.properties
  const optionsproperties =
    objectPlayer.properties && objectPlayer.properties.length > 0
      ? objectPlayer.properties.map(prop => {
          const name = getInfoElementHtml(prop).name;
          const isMortgaged = objectPlayer.mortgages.includes(prop); // 👈 validación si la propiedad esta hipotecada para no volver a hipotecarla
          return `<option value="${prop}" ${isMortgaged ? 'disabled' : ''}>${name}</option>`;
        }).join("")
      : `<option disabled>No hay propiedades</option>`;


  const optionMortgage = objectPlayer.mortgages && objectPlayer.mortgages.length > 0
      ? objectPlayer.mortgages.map(
          (mort) => `<option value="${mort}">${getInfoElementHtml(mort).name} </option>`  //Prop es el id que referencia la propiedad de la cual somos dueños.
        ).join("")
      : `<option disabled>No hay hipotecas</option>`;

  // Si no existe, lo creamos y lo agregamos al DOM
  if (!divInfoPlayer) {
    divInfoPlayer = document.createElement('div');
    divInfoPlayer.id = `player-${objectPlayer.color}`;
    divInfoPlayer.classList.add('playerInterface');
    gameDiv.appendChild(divInfoPlayer);
  }

  // Actualizamos su contenido (esto sobreescribe si ya existía) --> Aqui esta la inyeccion de la interface en cada recuadro
  divInfoPlayer.innerHTML = `
    <h2 class="player-header">
      <img src="https://flagsapi.com/${objectPlayer.country.toUpperCase()}/flat/64.png" 
           alt="Bandera-${objectPlayer.country}" 
           class="flag">
      ${objectPlayer.nick_name}
    </h2>
    <div class="player-content">
      <p class="money-text"><strong>Dinero :</strong> $${objectPlayer.money}</p>
      <select class="properties-select">
        <option value="" selected hidden>Propiedades</option>
        ${optionsproperties}
      </select>
      <button class="btn-interface" id="mortgage-${objectPlayer.color}">Hipotecar</button>
      <select class="properties-select">
        <option value="" selected hidden>Hipotecas</option>
        ${optionMortgage}
      </select>
      <button class="btn-interface" id="unMortgage-${objectPlayer.color}">DesHipotecar</button>
    </div>
  `;

  // Reasignamos el evento al header
  const header = divInfoPlayer.querySelector('.player-header');
  const contentPlayerInterface = divInfoPlayer.querySelector('.player-content');

  const mortgageBtn = divInfoPlayer.querySelector(`#mortgage-${objectPlayer.color}`);
  const unMortgageBtn = divInfoPlayer.querySelector(`#unMortgage-${objectPlayer.color}`);

  const propertiesSelect = mortgageBtn.previousElementSibling; // el Select de propiedades.
  const mortgageSelect = unMortgageBtn.previousElementSibling; // el select hipotecas.

  // Eliminamos listeners anteriores para evitar duplicados
  header.onclick = null;

  // Añadimos el toggle para mostrar/ocultar contenido
  header.addEventListener('click', () => {
    contentPlayerInterface.classList.toggle('collapsed');
  });

  mortgageBtn.addEventListener('click', () => {
    // aquí obtienes la propiedad seleccionada
    const selectedPropertyId = propertiesSelect.value;

    if (!selectedPropertyId) {
      alert('Selecciona una propiedad antes de hipotecar');
      return;
    }

    // Aquí ya puedes hacer tu acción específica
    document.dispatchEvent(new CustomEvent ('mortgagepropertie', {detail : [selectedPropertyId, objectPlayer]}));
  
  });
  // 🔹 DESHIPOTECAR
  unMortgageBtn.addEventListener('click', () => {
    const selectedMortgageId = mortgageSelect.value;
    if (!selectedMortgageId) {
      alert('Selecciona una propiedad hipotecada antes de deshipotecar');
      return;
    }

    document.dispatchEvent(
      new CustomEvent('unMortgagepropertie', { detail: [selectedMortgageId, objectPlayer] })
    );
  });
}

function endGameBrokeCondition(infoPlayers){

  const playersBroke = [];
  let endGameCondition = false;

  infoPlayers.forEach(player => {
      if (player.money <= 0 && player.properties.length === 0){
        playersBroke.push(player);
      }  
  });
  if (playersBroke.length === infoPlayers.length -1){ //Si solo hay un jugador que no este en banca rota, se acaba el juego.
    endGameCondition = true;
  }

  return endGameCondition;
}
/**
 * Devuelve Informacion de Una Casilla Mediante su ID.
 * @param {number} idElement - ID Casilla Especifica.
 * @returns {object} - Informacion Completa de la Casilla.
 */
function getInfoElementHtml(idElement){
  const infoObject = JSON.parse(document.getElementById(`square-${idElement}`).getAttribute('data-tile-info')) || {};
  return infoObject;
}

function buildHouseOrHotel(propertyId, player) {
  const property = boardData.bottom.concat(boardData.left, boardData.top, boardData.right)
    .find(tile => tile.id == propertyId);

  if (!property) {
    alert("No se encontró la propiedad.");
    return;
  }

  // Verificar si el jugador posee todas las propiedades del mismo color
  const sameColorProperties = boardData.bottom.concat(boardData.left, boardData.top, boardData.right)
    .filter(tile => tile.color === property.color);
  const ownsAll = sameColorProperties.every(tile => propertyOwners[tile.id] === player.getNickName());

  if (!ownsAll) {
    alert("Debes poseer todas las propiedades del mismo color para construir.");
    return;
  }

  // Construir casas o hotel
  if (!property.houses) property.houses = 0;
  if (property.houses < 4) {
    property.houses++;
    player.setMoney(player.getMoney() - 100); // Cada casa cuesta $100
    property.rent.base = property.rent.withHouse[property.houses - 1]; // Actualizar la renta
    alert(`Has construido una casa en ${property.name}. Ahora tiene ${property.houses} casas. La renta es de $${property.rent.base}.`);
  } else if (!property.hotel) {
    property.hotel = true;
    property.houses = 0; // Reemplaza las casas por un hotel
    player.setMoney(player.getMoney() - 250); // El hotel cuesta $250
    property.rent.base = property.rent.withHotel; // Actualizar la renta
    alert(`Has construido un hotel en ${property.name}. La renta ahora es de $${property.rent.base}.`);
    console.log(`Propiedad ${property.name} ahora tiene ${property.houses} casas y hotel: ${property.hotel}`);
    console.log(`Nueva renta: $${property.rent.base}`);
  } else {
    alert("Ya tienes un hotel en esta propiedad.");
  }

  // Actualizar visualmente la propiedad
  window.updatePropertyState(propertyId, player.getColor());
}

function mortgagepropertie(idpropertieMortgage, currentPlayer){
  const propInfo = getInfoElementHtml(idpropertieMortgage);
  if (propInfo){
    currentPlayer.mortgages.push(idpropertieMortgage); //Agregamos el id de la propiedad hipotecada (Esto ya que nuestra funcion loadPlayerInterface analiza este id y obtiene el nombre para mostrarlo)
    currentPlayer.money += propInfo.mortgage;
  }
  loadPlayerInteface(currentPlayer);
}

function unMortgagepropertie(idpropertieUnMortgage, currentPlayer){
  const deletedIndex = currentPlayer.mortgages.indexOf(`${idpropertieUnMortgage}`);
  
  if (deletedIndex !== -1){
    const mortgageInfo = getInfoElementHtml(idpropertieUnMortgage);
    currentPlayer.mortgages.splice(deletedIndex,1);
    currentPlayer.money -= (mortgageInfo.mortgage) * 1.1
    loadPlayerInteface(currentPlayer);
  }
  else{
    console.log('No se logro encontrar el indice de la propiedad a deshipotecar')
  }
}
/**
 * Procesa una acción generada por eventBox
 * @param {Object} action - La acción devuelta por eventBox
 * @param {Array} infoPlayers - Lista de jugadores
 * @param {number} turn - Índice del jugador actual
 */
function processAction(action, infoPlayers, turn) {
  // Si no hay acción (objeto vacío) no hacemos nada
  if (!action || Object.keys(action).length === 0) {
    return;
  }
  
  // Procesamos según el tipo de acción
  switch(action.actionType) {
    // COMPRAR PROPIEDADES
    case 'buy-property':
    case 'buy-railroad':
      // Preguntar si quiere comprar
      const wantToBuy = confirm(`¿Quieres comprar ${action.name} por $${action.price}?`);
      if (wantToBuy && infoPlayers[turn].getMoney() >= action.price) {
        
        // Restar dinero
        infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() - action.price);
        //pintar la casilla del color del jugador
         //  LÍNEA PARA ACTUALIZAR LA CASILLA
         window.updatePropertyState(
        action.propertyId || action.railroadId, 
        infoPlayers[turn].getColor(), 
        );
        // Registrar propiedad como comprada
        propertyOwners[action.propertyId || action.railroadId ] = infoPlayers[turn].getNickName();
        // Agregar a la lista de propiedades del jugador (si no existe la creamos)
        if (!infoPlayers[turn].properties) {
          infoPlayers[turn].properties = [];
        }
        infoPlayers[turn].properties.push(action.propertyId || action.railroadId );
        alert(`¡Has comprado ${action.name}!`);
      }
      break;
    
    // PAGAR RENTA
   case 'pay-rent':
   case 'pay-railroad-rent':
    const owner = infoPlayers.find(p => p.getNickName() === action.ownerId);
    if (owner) {
    // Buscar la propiedad en boardData y usar la renta actualizada
    const property = boardData.bottom.concat(boardData.left, boardData.top, boardData.right)
      .find(tile => tile.id == action.propertyId);
    const rentAmount = property?.rent.base || 0;

    infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() - rentAmount);
    owner.setMoney(owner.getMoney() + rentAmount);
    alert(`Pagas $${rentAmount} de renta a ${action.ownerId} por ${action.name}`);
    console.log(`Jugador ${infoPlayers[turn].getNickName()} paga $${rentAmount} a ${action.ownerId}`);
    loadPlayerInteface(owner);
   }
   break;
    
    // CARTAS
    case 'community-card':
    case 'chance-card':
      alert(`${action.description}`);
      if (action.money !== 0) {
        // Modificar dinero según la carta
        infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() + action.money);
        if (action.money > 0) {
          alert(`Recibes $${action.money}`);
        } else {
          alert(`Pagas $${Math.abs(action.money)}`);
        }
      }
      break;
    
    // IR A LA CÁRCEL
    case 'go-to-jail':
      infoPlayers[turn].position = action.destination;
      alert("¡Vas a la cárcel!");
      infoPlayers[turn].active = false; // El jugador pierde su próximo turno
      break;
    
    // PAGAR IMPUESTO
    case 'pay-tax':
      infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() - action.amount);
      alert(`Pagas $${action.amount} de ${action.name}`);
      break;

    // PASAR POR LA SALIDA
    case 'go':
      infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() + action.bonus);
      alert(`¡Pasas por la salida y recibes $${action.bonus}!`);
      break;

    case 'own-property':
      const canBuild = confirm(`¿Quieres construir en ${action.name}?`);
      if (canBuild) {
      buildHouseOrHotel(action.propertyId, infoPlayers[turn]);
  }
  break;
  }
  
  // Actualizar interfaz después de la acción
  loadPlayerInteface(infoPlayers[turn]);
}

function turnValidation (turn, infoPlayers, colorPlayerTurn, maxTurn){
  if (turn === maxTurn-1){
    turn = 0;
  } else {
    turn++;
  }
  let validation = false;
  if (infoPlayers[turn].color === colorPlayerTurn){
    validation = true;
  }
  return validation;
}

function finalScores(playersList){
  scoresList = [];
  playersList.forEach(player => {
    let scorePlayer = 0;
    scorePlayer += player.money;
    let propertiesPlayer = player.properties;
    let mortgagesPlayer = player.mortgages;
    
    propertiesPlayer.forEach(prop => {
      if (!mortgagesPlayer.includes(prop)){
        const infoProp = getInfoElementHtml(prop);
        let propertieScore = 0;
        propertieScore += infoProp.price;
        propertieScore += (infoProp.amountHouses * 100);
        propertieScore += (infoProp.amountHouses * 200);
        scorePlayer += propertieScore;
      }
    });
    scoresList.push({'nick_name': player.nick_name, 'score' : scorePlayer, 'country_code' : player.country })
  });
  return scoresList
}

function endGame(scoreList){
  scoreList.forEach(scorePlayer => {
    fetch('http://127.0.0.1/score-recorder',{
      method : 'POST',
      body : JSON.stringify(scorePlayer)
    })
  });
    
}