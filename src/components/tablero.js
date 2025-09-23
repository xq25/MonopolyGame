import { initCraps } from "./craps.js";

const board = document.getElementById("board");
export let boardData = {}; // Variable global exportada
const url = "http://127.0.0.1:5000/board";

function makeSquare(tile) { //creamos las casillas
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
    
    // Pasar los datos a logicGame.js
    // try {
    //   import('./logicGame.js').then(module => {
    //     if (typeof module.setBoardData === 'function') {
    //       module.setBoardData(data);
    //       console.log("Datos del tablero enviados a logicGame.js");
    //     }
    //   });
    // } catch (error) {
    //   console.error("Error al cargar módulo logicGame.js:", error);
    // }
    
    // Notificar que el tablero está listo
    document.dispatchEvent(new Event('boardReady'));
  })
  .catch(error => {
    console.error("Error al cargar el tablero:", error);
  });