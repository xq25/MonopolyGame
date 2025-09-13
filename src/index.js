import { loadContent } from './utils/utils.js'; // Importa la función para cargar contenido
import { changeSidebar } from './components/SidebarToggle.js'; // Importa la función para cambiar la barra lateral
const mainContainer = document.getElementById("mainContainer"); // Contenedor principal que incluye sidebar y contenido
const homeButton = document.getElementById("homeButton"); // boton home del Home
const rulesButton = document.getElementById("rulesButton"); // boton rules del Home
const playButton = document.getElementById("playButton"); // boton play del Home
const content = document.getElementById("content"); // el div donde se quiere cargar el contenido

// Cargar el contenido inicial (por defecto cargamos la introduccion del juego)
function initializeHomePage() {
    loadContent(content); // Carga la introducción del juego por defecto
    //Si se detecta un click en los botones, se carga el contenido correspondiente en el div content
    homeButton.addEventListener("click", () => loadContent(content, "./pages/documentMonopoly.html"));
    rulesButton.addEventListener("click", () => loadContent(content, "./pages/rulesMonopoly.html"));
   
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
        let script = document.createElement('script')
        const infoPlayers = e.detail; // Extraemos la iformacion mandada desde el customEvent para poder manejar la logica desde aqui
        // Puedes guardar infoPlayers en localStorage, sessionStorage, o pasarlo a tu backend si lo necesitas
        // Cargar la página del tablero
        loadContent(mainContainer, "/src/pages/tablero.html").then(() => {
            //Cargamos la pagian en la que esta el tablero.
            //reutilizamos la variable scrip, ya que ya no necesitamos el script de selectPlayers. Ahora cargamos la logica del tablero
            script.src = '/src/components/tablero.js'
            document.body.appendChild(script)
        })
        // Si necesitas pasar infoPlayers al tablero, puedes hacerlo aquí
        // Por ejemplo: localStorage.setItem('players', JSON.stringify(infoPlayers));
    }, { once: true }); //Esto nos indica que solo va a escuchar este evento una unica vez. Ya que solo despues de que la info en los formularios este bien, se iniciara el juego
}); 

