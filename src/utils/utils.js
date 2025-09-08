// Función para cargar contenido dinámicamente en el div content dentro del index.html
export function loadContent(element, page = "./pages/documentMonopoly.html") {
  // Si no se proporciona una página, se carga la introducción del juego (por defecto)
  return fetch(page)
    .then(response => response.text())
    .then(data => {
      element.innerHTML = data;
    })
    .catch(error => console.error("Error al cargar el contenido:", error));
}