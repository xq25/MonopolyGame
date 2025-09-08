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
document.addEventListener("DOMContentLoaded", () => {
    initializeHomePage();
    changeSidebar();
    playButton.addEventListener("click", () => loadContent(mainContainer, "/src/pages/selectPlayers.html"));

}); 

// Espera a que el DOM esté completamente cargado antes de inicializar la página y configurar la barra lateral
