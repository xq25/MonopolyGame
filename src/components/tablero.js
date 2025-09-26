window.boardData = {}; // Variable global exportada
const url = "http://127.0.0.1:5000/board";
// Al inicio de tablero.js (antes de la definición de makeSquare) PINTAR CASILLA DEL COLOR DEL JUGADOR 
window.updatePropertyState = function(propertyId, ownerColor) {
  const square = document.getElementById(`square-${propertyId}`);
  if (!square) return;
  
  // Busca el NUEVO div para el propietario (no el color-bar original)
  const ownerBar = square.querySelector('.owner-bar');
  if (!ownerBar) return;
  
  // Cambia el color del div del propietario (NO el color-bar original)
  if (ownerColor) {
    ownerBar.style.backgroundColor = ownerColor;
  } else {
    ownerBar.style.backgroundColor = "transparent";
  }

  // Obtiene el tipo de casilla
  const tileType = square.getAttribute('data-type');
  
  // Si es ferrocarril, solo mostrar el color del propietario (sin casas/hoteles)
  if (tileType === 'railroad') {
    ownerBar.textContent = ""; // No mostrar texto en ferrocarriles
    return;
  }

  // Si es propiedad normal, mostrar casas y hoteles
  if (tileType === 'property') {
    const tileInfo = square.getAttribute('data-tile-info');
    let casas = 0, hoteles = 0;
    if (tileInfo) {
      try {
        const info = JSON.parse(tileInfo);
        casas = info.amountHouses ?? 0;
        hoteles = info.amountHotels ?? 0;
      } catch {}
    }

    // Muestra el texto SIEMPRE (aunque sean 0) solo para propiedades
    ownerBar.textContent = `🏠${casas} 🏨${hoteles}`;
  }
}
function makeSquare(tile) { //creamos las casillas
   // Asegurar las nuevas keys dentro del objeto (solo para type 'property')
  if (tile.type === 'property') {
    if (typeof tile.amountHouses !== 'number') tile.amountHouses = 0;
    if (typeof tile.amountHotels !== 'number') tile.amountHotels = 0;
  }

  const div = document.createElement("div"); // creamos un div para estas en los bordes
  div.className = "square";
  
  //Agregamos todo esto al html:SQUAREEEE
  //no es necesario hacer una funcion ya que desde aca se la podemos asignar(mucho mas rapido jaja)
  if (tile.id !== undefined) { // si la casilla tiene id
    div.id = `square-${tile.id}`; // se lo asignamos al div
  }

  // AÑADE ESTA LÍNEA: Agregar data-type como atributo separado
  if (tile.type) div.setAttribute('data-type', tile.type);

  // ESTA ES LA LÍNEA CLAVE: toda la información en un solo atributo
  div.setAttribute('data-tile-info', JSON.stringify(tile));
  
  if (tile.color) {
    const color = document.createElement("div");// si tiene color, creamos un div para el color y se lo colocamos arriba
    color.className = "color-bar";// le asignamos la clase
    color.style.background = tile.color;// le asignamos a la casilla el color que le corresponde(si tiene)
    div.appendChild(color);
  }

  // NUEVO: div para el estado del propietario (para propiedades Y ferrocarriles)
  if (tile.type === "property" || tile.type === "railroad") {
    const ownerBar = document.createElement("div");
    ownerBar.className = "owner-bar";
    ownerBar.style.height = "18px";
    ownerBar.style.backgroundColor = "transparent";
    ownerBar.style.textAlign = "center";
    ownerBar.style.fontSize = "13px";
    ownerBar.style.fontWeight = "bold";
    ownerBar.style.lineHeight = "18px";
    ownerBar.style.color = "#fff";
    div.appendChild(ownerBar);
  }

  // Estado de la propiedad (nuevo)
  if (tile.type === "property" || tile.type === "railroad") {
    const stateDiv = document.createElement("div");
    stateDiv.className = "property-state";
    stateDiv.textContent = ""; // Por defecto
    div.appendChild(stateDiv);
  }

  // Indicador de estado (dueño / hipotecada / etc.) para propiedades y ferrocarriles
  if (tile.type === "property" || tile.type === "railroad") {
    const stateDiv = document.createElement("div");
    stateDiv.className = "property-state";
    stateDiv.textContent = "";
    div.appendChild(stateDiv);
  }

  const name = document.createElement("div");
  name.textContent = tile.name || ''; // le asignamos el nombre y inyectamos a la casilla en el tablero
  div.appendChild(name);

  return div;
}

fetch(url)
  .then(res => res.json())
  .then(data => {
    // Guardamos los datos completos del tablero
    boardData = data;

    const board = document.getElementById("board");
    if (!board) {
      console.error("Error: No se encontró el elemento con id 'board'");
      return;
    }
    
    const tiles = [...data.bottom, ...data.left, ...data.top, ...data.right];

    const grid = Array.from({ length: 11 }, () => Array(11).fill(null));
    //Se hace una cuadrícula de 11 x 11, toda vacía, para luego ir llenándola con casillas.

    tiles.forEach((tile, i) => {
      let row, col;

      if (i <= 10) {         // Borde inferior empezando por la esquina inferior derecha
        row = 10;
        col = 10 - i; //nos vamos moviendo por columnas 
      } else if (i <= 20) {  // Borde izquierdo
        row = 10 - (i - 10);  // nos vamos moviendo por filas de arriba a abajo
        col = 0;
      } else if (i <= 30) {  // Borde superior
        row = 0;
        col = i - 20; // nos movemos por columnas de izquierda a derecha
      } else {               // Borde derecho
        row = i - 30; //nos movemos por filas 
        col = 10;
      }

      grid[row][col] = makeSquare(tile);
    });

    // Pintar tablero
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        // Si hay casilla, la pintamos
        if (cell) {
          board.appendChild(cell);
        } else {
          // Si estamos en el centro (filas 1-9 y cols 1-9), no pintamos nada
          if (rowIndex >= 1 && rowIndex <= 9 && colIndex >= 1 && colIndex <= 9) {
            return; 
          }       
        }
      });
    });
    //debemos colocar el evento de tablero ready para que se coloquen justo despues que las casillas se ccreen en el DOM
    // Notificar que el tablero está listo
    document.dispatchEvent(new Event('boardReady'));
  })
  .catch(error => {
    console.error("Error al cargar el tablero:", error);
  });