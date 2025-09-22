import { loadContent } from './utils/utils.js'; // Importa la función para cargar contenido
import { changeSidebar } from './components/SidebarToggle.js'; // Importa la función para cambiar la barra lateral

import {loadPlayersInteface, initializePlayersClass} from './components/logicGame.js';

import { cargarRanking } from './components/ranking.js'; // Importa la función para cargar el ranking

const mainContainer = document.getElementById("mainContainer"); // Contenedor principal que incluye sidebar y contenido
const homeButton = document.getElementById("homeButton"); // boton home del Home
const rulesButton = document.getElementById("rulesButton"); // boton rules del Home
const playButton = document.getElementById("playButton"); // boton play del Home
const content = document.getElementById("content"); // el div donde se quiere cargar el contenido
const rankButton = document.getElementById("rankButton"); // boton rank del Home
// Cargar el contenido inicial (por defecto cargamos la introduccion del juego)
function initializeHomePage() {
    loadContent(content); // Carga la introducción del juego por defecto
    //Si se detecta un click en los botones, se carga el contenido correspondiente en el div content
    homeButton.addEventListener("click", () => loadContent(content, "./pages/documentMonopoly.html"));
    rulesButton.addEventListener("click", () => loadContent(content, "./pages/rulesMonopoly.html"));
    rankButton.addEventListener("click", () => loadContent(content, "./pages/ranking.html").then(() => {
        cargarRanking();
    }));
}
function initializeSelectPlayers(){
    loadContent(mainContainer, "/src/pages/selectPlayers.html").then(() => {
            // Carga manual del script después de que el contenido se haya cargado, Para asi poder encontrar los elementos que se ejecutan en el script
            let script = document.createElement('script');
            // Asignamos la ruta del script
            script.src = "/src/components/selectPlayers.js";
            // Añadimos el script al body para que se ejecute, por defecto se añade al final del body
            document.body.appendChild(script);
            // Escuchar el evento personalizado  
        });
}
document.addEventListener("DOMContentLoaded", () => {
    initializeHomePage();
    changeSidebar();
    playButton.addEventListener("click", () => {
        initializeSelectPlayers();
    });
    //Separamos la logica de cada uno de los eventos, ya qu8e por defecto este customEvent solo sucede despues de rellenar de manera correcta los formularios
    //Para cada carga de contenido por fuera, necesitamos crear un script que maneje todo su contenido de forma manual
    document.addEventListener('playersReady', (e) => {
        let script = document.createElement('script');
        const infoPlayers = e.detail; // Extraemos la iformacion mandada desde el customEvent para poder manejar la logica desde aqui
        // Puedes guardar infoPlayers en localStorage, sessionStorage, o pasarlo a tu backend si lo necesitas

        // Cargamos la página del tablero.
        loadContent(mainContainer, "/src/pages/tablero.html").then(() => {
            //Cargamos la pagian en la que esta el tablero.
            //reutilizamos la variable scrip, ya que ya no necesitamos el script de selectPlayers. Ahora cargamos la logica del tablero
            script.type = 'module';
            script.src = '/src/components/tablero.js';
            document.body.appendChild(script);
        }).then(() => {
            const objectList = initializePlayersClass(infoPlayers);
            objectList.forEach(player => {
                loadPlayersInteface(player)
            });
        });
        //Aqui hay que hacer otra funcion en la cual despues de cargar el tablero se carguen el resto de los elementos e inicie el juego
    }, { once: true }); //Esto nos indica que solo va a escuchar este evento una unica vez. Ya que solo despues de que la info en los formularios este bien, se iniciara el juego.
    
});  

