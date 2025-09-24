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

function isPropertyMortgaged(idProp, players){
  const ownerNick = propertyOwners[idProp];
  if (!ownerNick) return false;
  const ownerPlayer = players.find(p => p.getNickName() === ownerNick);
  if (!ownerPlayer) return false;
  if (!ownerPlayer.mortgages) ownerPlayer.mortgages = [];
  return ownerPlayer.mortgages.includes(String(idProp));
}

function getTileById(id){
  id = parseInt(id);
  return (boardData.bottom||[])
    .concat(boardData.left||[], boardData.top||[], boardData.right||[])
    .find(t => t.id === id);
}

export function playGame(infoPlayers, tablero){
  const popup = result?.closest('.crap-section') || result?.parentElement;
  let turn = 0;
  const maxTurn = infoPlayers.length;

  initCraps();
  if (popup) popup.style.display = "block";

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

  document.addEventListener('diceRolled', (e) => {
    const numDice = e.detail;
    const currentPlayer = infoPlayers[turn];

    // Cárcel
    if (currentPlayer.inJail) {
      if (currentPlayer.getMoney() >= 50) {
        const pay = confirm(`${currentPlayer.getNickName()} está en la cárcel. ¿Pagar $50 para salir?`);
        if (pay) {
          currentPlayer.setMoney(currentPlayer.getMoney() - 50);
          currentPlayer.inJail = false;
          alert('Sales de la cárcel.');
        } else {
          alert('No pagas. Pierdes el turno en la cárcel.');
          turn = (turn === maxTurn-1) ? 0 : turn + 1;
          return;
        }
      } else {
        alert('No puedes pagar $50. Pierdes el turno en la cárcel.');
        turn = (turn === maxTurn-1) ? 0 : turn + 1;
        return;
      }
    }

    setTimeout(()=>{ if(popup) popup.style.display="none"; },1500);

    if (currentPlayer.active){
      changePositionPlayer(numDice, currentPlayer, tablero);
      setTimeout(() => {
        const action = eventBox(currentPlayer.position.toString(), currentPlayer, infoPlayers);
        processAction(action, infoPlayers, turn);
        turn = (turn === maxTurn-1) ? 0 : turn + 1;
      }, 100);
    } else {
      turn = (turn === maxTurn-1) ? 0 : turn + 1;
    }

    setTimeout(()=>{ if(popup) popup.style.display="block"; },3000);
  });
}

function changePositionPlayer(numDados, infoPlayer, tablero){
  let posPlayer = infoPlayer.position + numDados;
  if (posPlayer >= 40){
    posPlayer -= 40;
    const goBonus = (boardData.bottom.concat(boardData.left, boardData.top, boardData.right)
      .find(tile => tile.id == 0)?.action?.money) || 200;
    infoPlayer.setMoney(infoPlayer.getMoney() + goBonus);
    alert(`¡${infoPlayer.getNickName()} pasa por la salida y recibe $${goBonus}!`);
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

function eventBox(numDice, currentPlayer, allPlayers) {
  const casilla = document.getElementById(`square-${numDice}`);
  if (!casilla) return {};
  const tipo = casilla.getAttribute('data-type');
  let squareData = casilla.getAttribute('data-tile-info')
      ? JSON.parse(casilla.getAttribute('data-tile-info')) : {};

  // Propiedades
  if (tipo === 'property'){
    const price = squareData.price || parseInt(casilla.getAttribute('data-price')) || 0;
    const propertyName = squareData.name || casilla.querySelector('div:last-child')?.textContent || 'Propiedad';
    const propertyColor = squareData.color || casilla.getAttribute('data-color') || '';
    const ownerNick = propertyOwners[numDice];
    const mortgaged = ownerNick ? isPropertyMortgaged(numDice, allPlayers) : false;

    if (!ownerNick){
      return {
        actionType: 'buy-property',
        propertyId: numDice,
        name: propertyName,
        price,
        color: propertyColor
      };
    } else if (mortgaged){
      return {
        actionType: 'mortgaged-property',
        propertyId: numDice,
        name: propertyName,
        ownerId: ownerNick
      };
    } else if (ownerNick !== currentPlayer.getNickName()){
      return {
        actionType: 'pay-rent',
        propertyId: numDice,
        name: propertyName,
        ownerId: ownerNick
      };
    } else {
      return {
        actionType: 'own-property',
        propertyId: numDice,
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
    switch(numDice){
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
      switch(numDice){
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
    const ownerNick = propertyOwners[numDice];
    const mortgaged = ownerNick ? isPropertyMortgaged(numDice, allPlayers) : false;

    if (!ownerNick){
      return {
        actionType: 'buy-railroad',
        railroadId: numDice,
        name: railroadName,
        price
      };
    } else if (mortgaged){
      return {
        actionType: 'mortgaged-railroad',
        railroadId: numDice,
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
        railroadId: numDice,
        name: railroadName,
        rent: rentAmount,
        ownerId: ownerNick
      };
    } else {
      return { actionType: 'own-railroad', railroadId: numDice, name: railroadName };
    }
  }

  return {};
}

export function initializePlayersClass(playersList){
  return playersList.map(item => {
    const p = new Player(item.nickName, item.country, item.color);
    if (!p.properties) p.properties = [];
    if (!p.mortgages) p.mortgages = [];
    return p;
  });
}

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

function mortgagepropertie(idpropertieMortgage, currentPlayer){
  if (!currentPlayer.mortgages) currentPlayer.mortgages = [];
  
  const propInfo = getInfoElementHtml(idpropertieMortgage);
  if (propInfo){
    currentPlayer.mortgages.push(idpropertieMortgage); //Agregamos el id de la propiedad hipotecada (Esto ya que nuestra funcion loadPlayerInterface analiza este id y obtiene el nombre para mostrarlo)
    currentPlayer.money += propInfo.mortgage;
  }
  loadPlayerInterface(currentPlayer);
}

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
      pj.inJail = true;
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