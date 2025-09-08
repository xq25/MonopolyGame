const SideBar = document.getElementById('SideBar');
const toggleButton = document.getElementById('toggleSidebar');
const mainContent = document.getElementById('mainContent');

//Este script es el encargado de modificar el sidebar y el contenido principal al hacer click en el boton toggleSidebar
export function changeSidebar() {
    toggleButton.addEventListener('click', () => {
        //Si la pantalla es grande, no se hace nada. Pero si la pantalla es pequeña, se alterna la clase 'open' del sidebar y se ajusta el contenido principal
        if (window.innerWidth < 992) {
            // En pantallas pequeñas: alternar clase
            SideBar.classList.toggle('open'); //Por defecto el sidebar tiene la clase 'open'
            if (SideBar.classList.contains('open')) {
                // Si el sidebar está abierto, ajustar el contenido principal con las suguientes margenes y anchos
                mainContent.style.marginLeft = '25%';
                mainContent.style.width = '75%';//Ajuste para pantallas pequeñas no se extienda a la derecha
                toggleButton.style.width = '25%';
            } else {
                mainContent.style.marginLeft = '1%';
                mainContent.style.width = '99%';
                toggleButton.style.width = '10%';
            }
        }
    });
    //window es el objeto global que representa la ventana del navegador y resize es el evento que se dispara cuando se cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        //Nos permite evitar bugs al cambiar el tamaño de la ventana de pequeño a grande otra vez 
        // Si la ventana se redimensiona a un tamaño grande, asegurarse de que el sidebar esté visible y el contenido principal ajustado
        if (window.innerWidth >= 992) {
            // En pantallas grandes: asegurarse de que el sidebar esté visible y el contenido principal ajustado, ademas de ajustar bien el tamaño del toggleButton
            SideBar.classList.add('open');
            mainContent.style.marginLeft = '25%';
            mainContent.style.width = '75%';
            toggleButton.style.width = '25%';
        }
    });
}
