import { Player } from '../model/players.js'
import { initCraps } from '../components/craps.js'

// Dueños: { idPropiedad : nick }
const propertyOwners = {};
const endButton = document.getElementById('endGameBtn');

// Acceso global
window.boardData = {};

export function setBoardData(data) {
  boardData = data;
  console.log("Datos del tablero cargados en logicGame.js");
}

/**
 * 
 * @param {number} idProp - Este id hacer referencia al ID de la casilla en la que esta el jugador, en este caso (una propiedad).
 * @param {Player[]} players - Este parametro contiene los objetos de todos los jugadores, para asi validar de quien es la propiedad hipotecada.
 * @returns 
 */
function isPropertyMortgaged(idProp, players){
  const ownerNick = propertyOwners[idProp]; //Verificamos si la propiedad tiene dueño.
  if (!ownerNick) return false; // Si no tiene dueño, por defecto no esta hipotecada.
  const ownerPlayer = players.find(p => p.getNickName() === ownerNick); //Buscamos en nuestros player el que coincida su nickname con el nickname del jugador que tiene dicha propiedad hipotecada.
  if (!ownerPlayer) return false;
  if (!ownerPlayer.mortgages) ownerPlayer.mortgages = [];
  return ownerPlayer.mortgages.includes(String(idProp)); //Agregamos este id a nuestra variable global.
}

/**
 * Esta funcion esta encargada de solicitar y buscar la informacion de una casilla especifica dentro de nuestro variable global boardData.
 * @param {number} id - Este parametro hace referencia al id de la casilla solicitada 
 * @returns 
 */
function getTileById(id){
  id = parseInt(id);
  return (boardData.bottom||[])
    .concat(boardData.left||[], boardData.top||[], boardData.right||[]) //Buscamos en todas las casillas almacenadas en los diferentes keys
    .find(t => t.id === id); // Buscamos dentro de cada uno de esos keys si alguna de las casillas tiene dicho ID.
}

/**
 * Esta funcion es la que maneja toda la logica dentro de la partida. Cada uno de los eventos y sus respuestas dentro del tablero. Esta es la funcion que llamamos desde el index.js.
 * 
 * @param {Player[]} infoPlayers - Este parametro es el que almacena todos nuestros players y se actualiza a medida que pasa el juego.
 * @param {HTMLElement} tablero - Este es el elemento HTML del tablero. Lo usamos para hacer actualizaciones sobre el y acceder a las casillas.
 */
export function playGame(infoPlayers, tablero){
  const popup = result?.closest('.crap-section') || result?.parentElement;

  let turn = 0; // Manejamos una variable en la cual vamos a ir almacenando la logica de los turnos que corresponde al mismo tiempo a un  indice de infoPlayers.
  const maxTurn = infoPlayers.length; // maxTurn permite saber la cantidad de usuarios para asi manejar el limite superior de nuestra logica de turnos.
  initializePositionPlayers(infoPlayers, tablero);
  initCraps(); // Inicializamos los dados para realizar el primer turno
  if (popup) popup.style.display = "block";

  // Buscamos el elemento boton endGame
  let endGameBtn = document.getElementById('endGameBtn');

  if (!endGameBtn) {
    // Si no existe el elemento lo creamos (depuracion).

    endGameBtn = document.createElement('button');
    endGameBtn.id = 'endGameBtn';
    endGameBtn.textContent = 'Finalizar';
    endGameBtn.classList.add('btn-interface'); 

    document.body.appendChild(endGameBtn); // Lo agregamos al juego

    endGameBtn.addEventListener('click', () => { //Evento de finalizacion del juego.

      // 💠 Forzar actualización/validación de infoPlayers aquí para que no se carguen datos invalidos al score
      const hasInvalid = infoPlayers.some(p => 
        p.money == null || !Array.isArray(p.properties) || !Array.isArray(p.mortgages)  //Validamos que todos los datos del score correspondan a la naturalidad necesaria para poder trabajar con ellos y sacar el score de cada jugador
      );
      if (hasInvalid) {
        alert('Hay datos incompletos en infoPlayers'); // Alerta en caso tal de que hayan datos NaN o Null. Impide calcular los scores.
        return;
      }

      // 💠 calculamos score con datos frescos y validos.
      const scoreList = finalScores(infoPlayers);

      // 💠 Disparamos el evento enGame que sera escuchado desde el index.js. Esta es nuestra conexion de vuelta al index. Ya que despues de esto no hay mas logica del juego.
      document.dispatchEvent(new CustomEvent('endGame', { detail: scoreList }/*mandamos los scores calculados la index.js*/)); // Disparamos un evento personalizado para manejarlo todo desde el index.js
    });
  }

//🟢 Listener de eventos individuales de cada proceso de la interfaz del usuario. 

//  🔵 Evento Hipotecar una Propiedad!
  //Esto no depende directamente del turno del usuario. (Se puede hipotecar una propiedad siempre que el usuario necesite liquidez).
  document.addEventListener('mortgagepropertie', (e) => { //estamos a la escucha del evento si se hipoteca una casa para ejecutar la funcion de forma independiente. (Esto lo podemos hacer ya que la propia funcion refresca la interfaz del usuario)
    mortgagepropertie(e.detail[0],e.detail[1]);
  });

//  🔵 Evento Des-Hipotecar una Propiedad!
  //Esto depende directamente del turno del usuario. (No se puede hipotecar una propiedad fuera del turno del usuario).
  document.addEventListener('unMortgagepropertie', (e) => {

    if (turnValidation(turn, infoPlayers, e.detail[1].color, maxTurn)){ // Validamos que el color del player que ejecuta la accion sea correspodiente al turno asignado.
      unMortgagepropertie(e.detail[0], e.detail[1]);
    }
    else{
      //En caso tal de que no sea asi, se le avisa al jugador con el alert.
      alert('No puedes Deshipotecar propiedades fuera de tu turno'); 
      return;
    }
  });

  //Evento de lanzamiento de dados (Base del Juego y manejo de turnos).
  document.addEventListener('diceRolled', (e) => {
    //Cada vez que se lanza el dado se cambia el turno.

    const numDice = e.detail; //Almacenamos el numero sacado por los dados (sea manual o random).
    const currentPlayer = infoPlayers[turn]; //Sacamos la informacion del player correspondiente al turno.

    // Cárcel
    if (!currentPlayer.active) {  //Si el jugador esta en la carcel(active = false), se activan los eventos para salir de la carcel. 
      console.log(currentPlayer.active)
      if (currentPlayer.getMoney() >= 50) { // Se valida que el usuario tenga dinero como para salir de la carcel.
        const pay = confirm(`${currentPlayer.getNickName()} está en la cárcel. ¿Pagar $50 para salir?`);

        if (pay) { // Pago para salir de la carcel.

          currentPlayer.setMoney(currentPlayer.getMoney() - 50);
          currentPlayer.active = true;
          alert('Sales de la cárcel.');
        } else { // No se pago para salir de la carcel.(Pero se tiene el dinero)

          alert('No pagas. Pierdes el turno en la cárcel.');
          turn = (turn === maxTurn-1) ? 0 : turn + 1;
          return;
        }
      } else { // Si no se tiene el suficiente dinero se pierde el turno automaticamente.

        alert('No puedes pagar $50. Pierdes el turno en la cárcel.');
        turn = (turn === maxTurn-1) ? 0 : turn + 1;
        return;
      }
    }

    setTimeout(()=>{ if(popup) popup.style.display="none"; },1500);

    if (currentPlayer.active){ // Si el juegador no esta en la carcel (active = true), entonces manejamos los eventos del tuno comun y corriente. 

      changePositionPlayer(numDice, currentPlayer, tablero); // Cambiamos primero la posicion del jugador segun el numero en los dados.
      setTimeout(() => {
        const action = eventBox(currentPlayer.position.toString(), currentPlayer, infoPlayers); // Almacenamos la accion a realizar, llegado al caso que lo haya.
        processAction(action, infoPlayers, turn); // Procesamos y aplicamos los cambios correspondientes de dicha accion.
        turn = (turn === maxTurn-1) ? 0 : turn + 1; // Avanzamos el turno sin salirnos del limite de jugadores.
      }, 100);
    } else {
      turn = (turn === maxTurn-1) ? 0 : turn + 1;
    }

    setTimeout(()=>{ if(popup) popup.style.display="block"; },3000);
  });
}

/**
 * Esta funcion es la encargada de todos las acciones de movimiento de jugador,--> excepto en ir a la carcel.
 * La logica soporta movimientos arbitrarios muy grandes o negativos.
 * 
 * @param {number} numDados - Este parametro almacena el numero sacado en el turno del jugador por los dados. 
 * @param {object} infoPlayer - Este parametro almacena todo el objeto del player que esta realizando la funcion de moverse.
 * @param {HTMLElement} tablero - Este parametro almacena el elemento HTML del tablero el cual va a ser modificado.
 * @returns - No retornamos nada, se hacen las modificaciones en los atributos del player correspondiente y se pinta su posicion en el tablero.
 */
function changePositionPlayer(numDados, infoPlayer, tablero){
  let posPlayer = infoPlayer.position + numDados;

  if (posPlayer >= 40){

    let turnsOnBoard = Math.trunc(posPlayer / 40);
    posPlayer -= (40 * turnsOnBoard);

    const goBonus = (boardData.bottom.concat(boardData.left, boardData.top, boardData.right)
      .find(tile => tile.id == 0)?.action?.money) || 200;

    infoPlayer.setMoney(infoPlayer.getMoney() + goBonus*turnsOnBoard);
    alert(`¡${infoPlayer.getNickName()} pasa por la salida y recibe $${goBonus}!`);
  }
  else if (posPlayer < 0){
    
    let turnsOnBoard = Math.floor(Math.abs(posPlayer) / 40) + 1; // +1 para cubrir negativos exactos
    posPlayer += turnsOnBoard * 40;
  }

  infoPlayer.position = posPlayer;

  const targetSquare = document.getElementById(`square-${posPlayer}`);
  if (!targetSquare){
    console.error(`No existe la casilla con id="square-${posPlayer}"`);
    return;
  }

  const oldToken = tablero.querySelector(`#token-${infoPlayer.color}`);
  if (oldToken) oldToken.remove();

  const tokenPlayer = document.createElement('div');
  tokenPlayer.classList.add('token');
  tokenPlayer.id = `token-${infoPlayer.color}`;
  targetSquare.appendChild(tokenPlayer);
}

/**
 * Esta funcion solo la utilizamoss al hacer el llamado a playGame, ya que solo se encarga de pintar a todos los jugadores en la primera casilla (square-0 o casilla de salida).
 * @param {Player[]} playersList 
 * @param {HTMLElement} tablero 
 */
function initializePositionPlayers(playersList, tablero){
  playersList.forEach(player => {
    changePositionPlayer(0, player, tablero)
  });
}

function eventBox(posPlayer, currentPlayer, allPlayers) {
  const casilla = document.getElementById(`square-${posPlayer}`);
  if (!casilla) return {};
  const tipo = casilla.getAttribute('data-type');
  let squareData = casilla.getAttribute('data-tile-info')
      ? JSON.parse(casilla.getAttribute('data-tile-info')) : {};

  // Propiedades
  if (tipo === 'property'){
    const price = squareData.price || parseInt(casilla.getAttribute('data-price')) || 0;
    const propertyName = squareData.name || casilla.querySelector('div:last-child')?.textContent || 'Propiedad';
    const propertyColor = squareData.color || casilla.getAttribute('data-color') || '';
    const ownerNick = propertyOwners[posPlayer];
    const mortgaged = ownerNick ? isPropertyMortgaged(posPlayer, allPlayers) : false;

    if (!ownerNick){
      return {
        actionType: 'buy-property',
        propertyId: posPlayer,
        name: propertyName,
        price,
        color: propertyColor
      };
    } else if (mortgaged){
      return {
        actionType: 'mortgaged-property',
        propertyId: posPlayer,
        name: propertyName,
        ownerId: ownerNick
      };
    } else if (ownerNick !== currentPlayer.getNickName()){
      return {
        actionType: 'pay-rent',
        propertyId: posPlayer,
        name: propertyName,
        ownerId: ownerNick
      };
    } else {
      return {
        actionType: 'own-property',
        propertyId: posPlayer,
        name: propertyName,
        canBuild: true
      };
    }
  }

  // Comunidad
  else if (tipo === 'community_chest'){
    const cards = boardData.community_chest || [];
    if (!cards.length){
      return { actionType: 'community-card', description: "Recibes $100 de la banca", money: 100 };
    }
    const card = cards[Math.floor(Math.random()*cards.length)];
    return {
      actionType: 'community-card',
      description: card.description || "Carta comunidad",
      money: card.action?.money || 0
    };
  }

  // Suerte
  else if (tipo === 'chance'){
    const cards = boardData.chance || [];
    if (!cards.length){
      return { actionType: 'chance-card', description: "Pagas $50 de multa", money: -50 };
    }
    const card = cards[Math.floor(Math.random()*cards.length)];
    return {
      actionType: 'chance-card',
      description: card.description || "Carta de suerte",
      money: card.action?.money || 0
    };
  }

  // Especiales
  else if (tipo === 'special'){
    switch(posPlayer){
      case '0': return { actionType: 'go', bonus: squareData.action?.money || 200 };
      case '10': return { actionType: 'jail-visit' };
      case '20': return { actionType: 'free-parking' };
      case '30': return { actionType: 'go-to-jail', destination: 10 };
      default: return {};
    }
  }

  // Impuestos
  else if (tipo === 'tax'){
    let amount = 0;
    if (squareData.action?.money){
      amount = Math.abs(squareData.action.money);
    } else {
      switch(posPlayer){
        case '4': amount = 200; break;
        case '38': amount = 100; break;
        default: amount = 50;
      }
    }
    return { actionType: 'pay-tax', amount, name: squareData.name || 'Impuesto' };
  }

  // Ferrocarriles
  else if (tipo === 'railroad'){
    const price = squareData.price || parseInt(casilla.getAttribute('data-price')) || 200;
    const railroadName = squareData.name || casilla.querySelector('div:last-child')?.textContent || 'Ferrocarril';
    const ownerNick = propertyOwners[posPlayer];
    const mortgaged = ownerNick ? isPropertyMortgaged(posPlayer, allPlayers) : false;

    if (!ownerNick){
      return {
        actionType: 'buy-railroad',
        railroadId: posPlayer,
        name: railroadName,
        price
      };
    } else if (mortgaged){
      return {
        actionType: 'mortgaged-railroad',
        railroadId: posPlayer,
        name: railroadName,
        ownerId: ownerNick
      };
    } else if (ownerNick !== currentPlayer.getNickName()){
      // contar ferrocarriles
      const ownedRailroads = Object.keys(propertyOwners).filter(id => {
        const el = document.getElementById(`square-${id}`);
        return propertyOwners[id] === ownerNick && el?.getAttribute('data-type') === 'railroad';
      }).length;
      const rentAmount = 25 * Math.pow(2, ownedRailroads - 1);
      return {
        actionType: 'pay-railroad-rent',
        railroadId: posPlayer,
        name: railroadName,
        rent: rentAmount,
        ownerId: ownerNick
      };
    } else {
      return { actionType: 'own-railroad', railroadId: posPlayer, name: railroadName };
    }
  }

  return {};
}
/**
 * Esta funcion la utilizamos para inicializar como instancias diccionarios, Asi agregando atributos pre-definidos y logrando trabajar con objetos.
 * @param {Object[]} playersList - Este parametro almacena la informacion de los formularios iniciales.
 * @returns - Nos retorna una lista de Objetos de la clase player con todos los atributos referenciados en el enunciado del proyecto (por defecto).
 */
export function initializePlayersClass(playersList){
  return playersList.map(item => {
    const p = new Player(item.nickName, item.country, item.color);
    if (!p.properties) p.properties = [];
    if (!p.mortgages) p.mortgages = [];
    return p;
  });
}

/**
 * 
 * 
 * @param {Player} objectPlayer - Este parametro almacena una instancia player con todos sus atributos para ser cargados (visualmente)
 * @returns 
 */
export function loadPlayerInterface(objectPlayer){
  if (!objectPlayer) return;
  const gameDiv = document.getElementById('gameDiv');
  let divInfoPlayer = document.getElementById(`player-${objectPlayer.color}`);

  // Construimos las options del select a partir de objectPlayer.properties
  const optionsproperties =
    objectPlayer.properties && objectPlayer.properties.length > 0
      ? objectPlayer.properties.map(prop => {
          const name = getInfoElementHtml(prop).name;
          const dis = objectPlayer.mortgages?.includes(prop);
          return `<option value="${prop}" ${dis?'disabled':''}>${name}</option>`;
        }).join("")
      : `<option disabled>No hay propiedades</option>`;

  const optionMortgage =
    objectPlayer.mortgages && objectPlayer.mortgages.length
      ? objectPlayer.mortgages.map(m => `<option value="${m}">${getInfoElementHtml(m).name}</option>`).join("")
      : `<option disabled>No hay hipotecas</option>`;

  if (!divInfoPlayer){
    divInfoPlayer = document.createElement('div');
    divInfoPlayer.id = `player-${objectPlayer.color}`;
    divInfoPlayer.classList.add('playerInterface');
    gameDiv.appendChild(divInfoPlayer);
  }

  divInfoPlayer.innerHTML = `
    <h2 class="player-header">
      <img src="https://flagsapi.com/${objectPlayer.country.toUpperCase()}/flat/64.png" class="flag">
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

  const header = divInfoPlayer.querySelector('.player-header');
  const content = divInfoPlayer.querySelector('.player-content');
  header.onclick = null;
  header.addEventListener('click', () => content.classList.toggle('collapsed'));

  const mortgageBtn = divInfoPlayer.querySelector(`#mortgage-${objectPlayer.color}`);
  const unMortgageBtn = divInfoPlayer.querySelector(`#unMortgage-${objectPlayer.color}`);
  const propertiesSelect = mortgageBtn.previousElementSibling;
  const mortgageSelect = unMortgageBtn.previousElementSibling;

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

  unMortgageBtn.addEventListener('click', () => {
    const selectedMortgagedId = mortgageSelect.value;
    if (!selectedMortgagedId){ alert('Selecciona una propiedad hipotecada'); return; }
    document.dispatchEvent(new CustomEvent('unMortgagepropertie',{ detail:[selectedMortgagedId, objectPlayer] }));
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
  return playersBroke.length === infoPlayers.length - 1;
}

/**
 * Esta funcion noss permite acceder a la informacion principal de una casilla para asi trabajar con todos sus datos.
 * @param {number} idElement - Este parametro almacena el id de la casilla sobre la cual deseamos acceder a su variable (data-tile-info)
 * @returns - Nos devuelve la informacion de la casilla en forma de objeto.
 */
function getInfoElementHtml(idElement){
  const el = document.getElementById(`square-${idElement}`);
  if (!el) return {};
  return JSON.parse(el.getAttribute('data-tile-info')) || {};
}

function buildHouseOrHotel(propertyId, player){
  const property = getTileById(propertyId);
  if (!property){ alert("No se encontró la propiedad."); return; }

  const sameColor = (boardData.bottom||[])
    .concat(boardData.left||[], boardData.top||[], boardData.right||[])
    .filter(t => t.color === property.color);
    
  const ownsAll = sameColor.every(t => propertyOwners[t.id] === player.getNickName());
  if (!ownsAll){ alert("Debes poseer todo el grupo de color."); return; }

  if (!property.houses) property.houses = 0;
  if (typeof property.amountHouses !== 'number') property.amountHouses = 0;
  if (typeof property.amountHotels !== 'number') property.amountHotels = 0;

  if (property.houses < 4 && !property.hotel){
    property.houses++;
    property.amountHouses = property.houses;
    getInfoElementHtml(propertyId).amountHouses = property.houses;
    player.setMoney(player.getMoney() - 100);
    property.rent.base = property.rent.withHouse[property.houses - 1];
    alert(`Construyes casa en ${property.name}. Casas: ${property.houses}. Renta: $${property.rent.base}`);
  } else if (!property.hotel){
    property.hotel = true;
    property.houses = 0;
    property.amountHouses = 0;
    property.amountHotels = 1;
    player.setMoney(player.getMoney() - 250);
    property.rent.base = property.rent.withHotel;
    alert(`Construyes hotel en ${property.name}. Renta: $${property.rent.base}`);
  } else {
    alert("Ya tienes hotel.");
  }
  // Actualizar atributo data-tile-info en el DOM
  const squareEl = document.getElementById(`square-${propertyId}`);
  if (squareEl){
    try {
      const info = JSON.parse(squareEl.getAttribute('data-tile-info')) || {};
      info.amountHouses = property.amountHouses ?? property.houses ?? 0;
      info.amountHotels = property.amountHotels ?? (property.hotel ? 1 : 0);
      info.houses = property.houses;       // mantener sincronizado si lo usas
      info.hotel = !!property.hotel;
      squareEl.setAttribute('data-tile-info', JSON.stringify(info));
    } catch(e){
      console.warn('No se pudo actualizar data-tile-info para', propertyId, e);
    }
  }

  window.updatePropertyState(propertyId, player.getColor());
  loadPlayerInterface(player);
}

/**
 * 
 * @param {number} idpropertieMortgage - Este parametro almecena la el id de la propiedad que deseamos hipotecar.
 * @param {Player} currentPlayer - Este parametro contiene todo el objeto del player que desea hipotecar una propiedad.
 */
function mortgagepropertie(idpropertieMortgage, currentPlayer){
  if (!currentPlayer.mortgages) currentPlayer.mortgages = [];
  
  const propInfo = getInfoElementHtml(idpropertieMortgage);
  if (propInfo){
    currentPlayer.mortgages.push(idpropertieMortgage); //Agregamos el id de la propiedad hipotecada (Esto ya que nuestra funcion loadPlayerInterface analiza este id y obtiene el nombre para mostrarlo)
    currentPlayer.money += propInfo.mortgage;
  }
  loadPlayerInterface(currentPlayer);
}

/**
 * 
 * @param {number} idpropertieUnMortgage - Este parametro almecena la el id de la propiedad que deseamos des-hipotecar.
 * @param {Player} currentPlayer - Este parametro contiene todo el objeto del player que desea des-hipotecar una propiedad.
 */
function unMortgagepropertie(idpropertieUnMortgage, currentPlayer){
  const deletedIndex = currentPlayer.mortgages.indexOf(`${idpropertieUnMortgage}`);
  
  if (deletedIndex !== -1){
    const mortgageInfo = getInfoElementHtml(idpropertieUnMortgage);
    currentPlayer.mortgages.splice(deletedIndex,1);
    currentPlayer.money -= (mortgageInfo.mortgage) * 1.1
    loadPlayerInterface(currentPlayer);
  }
}

function processAction(action, infoPlayers, turn){
  if (!action || !Object.keys(action).length) return;

  switch(action.actionType){

    case 'buy-property':
    case 'buy-railroad': {
      const want = confirm(`¿Comprar ${action.name} por $${action.price}?`);
      if (want && infoPlayers[turn].getMoney() >= action.price){
        infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() - action.price);
        window.updatePropertyState(action.propertyId || action.railroadId, infoPlayers[turn].getColor());
        propertyOwners[action.propertyId || action.railroadId] = infoPlayers[turn].getNickName();
        if (!infoPlayers[turn].properties) infoPlayers[turn].properties = [];
        infoPlayers[turn].properties.push(action.propertyId || action.railroadId);
        alert(`¡Has comprado ${action.name}!`);
      }
      break;
    }

    case 'mortgaged-property':
    case 'mortgaged-railroad':
      alert(`La propiedad ${action.name} está hipotecada. No se paga renta.`);
      break;

    case 'pay-rent': {
      const propId = action.propertyId;
      if (isPropertyMortgaged(propId, infoPlayers)){
        alert(`La propiedad ${action.name} está hipotecada. No se paga renta.`);
        break;
      }
      const owner = infoPlayers.find(p => p.getNickName() === action.ownerId);
      if (owner){
        const tile = getTileById(propId);
        const rentAmount = tile?.rent?.base || 0;
        infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() - rentAmount);
        owner.setMoney(owner.getMoney() + rentAmount);
        alert(`Pagas $${rentAmount} a ${action.ownerId} por ${action.name}`);
        loadPlayerInterface(owner);
      }
      break;
    }

    case 'pay-railroad-rent': {
      const propId = action.railroadId;
      if (isPropertyMortgaged(propId, infoPlayers)){
        alert(`El ferrocarril ${action.name} está hipotecado. No se paga renta.`);
        break;
      }
      const owner = infoPlayers.find(p => p.getNickName() === action.ownerId);
      if (owner){
        const rentAmount = action.rent ?? 25;
        infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() - rentAmount);
        owner.setMoney(owner.getMoney() + rentAmount);
        alert(`Pagas $${rentAmount} a ${action.ownerId} por ${action.name}`);
        loadPlayerInterface(owner);
      }
      break;
    }

    case 'community-card':
    case 'chance-card':
      alert(action.description);
      if (action.money){
        infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() + action.money);
        alert(action.money > 0 ? `Recibes $${action.money}` : `Pagas $${Math.abs(action.money)}`);
      }
      break;

    case 'go-to-jail': {
      const pj = infoPlayers[turn];
      alert("¡Vas a la cárcel!");
      pj.position = action.destination;
      pj.active = false;
      const jailSquare = document.getElementById(`square-${action.destination}`);
      if (jailSquare){
        const oldToken = document.querySelector(`#token-${pj.color}`);
        if (oldToken) oldToken.remove();
        const token = document.createElement('div');
        token.classList.add('token');
        token.id = `token-${pj.color}`;
        jailSquare.appendChild(token);
      }
      break;
    }

    case 'pay-tax':
      infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() - action.amount);
      alert(`Pagas $${action.amount} de ${action.name}`);
      break;

    case 'go':
      infoPlayers[turn].setMoney(infoPlayers[turn].getMoney() + action.bonus);
      alert(`¡Pasas por la salida y recibes $${action.bonus}!`);
      break;

    case 'own-property': {
      const build = confirm(`¿Construir en ${action.name}?`);
      if (build) buildHouseOrHotel(action.propertyId, infoPlayers[turn]);
      break;
    }

    case 'own-railroad':
      break;

    case 'jail-visit':
    case 'free-parking':
    default:
      break;
  }

  loadPlayerInterface(infoPlayers[turn]);
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

/**
 * 
 * @param {Player[]} playersList - Este parametro almacena la lista de instancias player para poder sacar sus atributos y asi utilizarlos en el calculo del score.
 * @returns {object[]}
 */
function finalScores(playersList){
  let scoresList = [];
  playersList.forEach(player => {
    // Asegura money como número
    let scorePlayer = Number(player.money) || 0;

    let propertiesPlayer = player.properties || [];
    let mortgagesPlayer = player.mortgages || [];

    propertiesPlayer.forEach(prop => {
      if (!mortgagesPlayer.includes(prop)){
        const infoProp = getInfoElementHtml(prop) || {};
        let price = Number(infoProp.price) || 0;
        let houses = Number(infoProp.amountHouses) || 0;

        let propertieScore = price + (houses * 100) + (houses * 200);
        scorePlayer += propertieScore;
      }
    });

    scoresList.push({
      'nick_name': player.nick_name,
      'score': isNaN(scorePlayer) ? 0 : scorePlayer, // fallback
      'country_code': player.country
    });
  });
  return scoresList;
}

