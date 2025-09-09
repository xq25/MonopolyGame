//Nota: Este script se carga dinámicamente desde index.js cuando se carga selectPlayers.html
//Usamos una IIFE (Immediately Invoked Function Expression) para evitar contaminar el espacio global y asegurar que el código se ejecute una vez que el DOM esté listo
/*1. Evita contaminación global
El IIFE crea un "ámbito privado" para tus variables y funciones.
Sin el IIFE, todas las variables (formRed, countGreen, etc.) quedarían en el ámbito global (window), lo que puede causar conflictos con otros scripts.
2. Ejecución inmediata
El IIFE garantiza que el código se ejecute justo cuando el script se carga.
Si solo defines funciones sin ejecutarlas, nada ocurre hasta que las llames explícitamente.
3. Seguridad y orden
El IIFE asegura que el código se ejecute en el orden correcto, justo después de insertar el HTML dinámico.
Sin el IIFE, podrías tener problemas si el script se carga antes de que el HTML esté en el DOM.*/

(function() { // <----- esto es el IIFE, Funcion que se ejecuta inmediatamente despues de ser definida
    // Seleccion de los formularios de los jugadores por su ID
    const formRed = document.getElementById('form-red');
    const formBlue = document.getElementById('form-blue');
    const formGreen = document.getElementById('form-green');
    const formYellow = document.getElementById('form-yellow');

    function loadCountries(elementSelector){
        fetch('http://127.0.0.1:5000/countries')  //Llamamos a nuestro endpoint que manda mediante un get la lista de paises
            .then(response => response.json())
            .then(data => {
                data.forEach(country => {
                    const option = document.createElement('option');
                    option.value = Object.keys(country)[0]; // Usamos el código del país como valor, Que en este caso es la key de cada json
                    option.textContent = Object.values(country)[0]; // Mostramos el nombre del país
                    elementSelector.appendChild(option);
                });
            });
    }
    // Función para cargar el formulario de un jugador en el div correspondiente
    function loadForm(elementForm) {
        fetch('/src/pages/formUser.html')
            .then(response => response.text())
            .then(html => {
                elementForm.innerHTML = html; // Insertamos el HTML del formulario en el div correspondiente (formRed, formBlue, etc.)
                const countrySelect = elementForm.querySelector('.countries-selector'); // Seleccionamos el select del formulario insertado que deberia de existir al momento de cargarlo.
                if (countrySelect) { //Protegemos con un if por si no se encuentra el select, para evitar errores
                    loadCountries(countrySelect); // Cargamos los países en el select del formulario insertado
                }
            });
    }
    // Carga los formularios de los jugadores rojo y azul (*por defecto siempre estan cargados)
    function basicLoadForm(){
        loadForm(formRed);
        loadForm(formBlue);
    }

    // Ejecuta directamente, ya que el HTML ya está en el DOM
    basicLoadForm(); //Cargamos los formularios de los jugadores rojo y azul por defecto

    let countGreen = 0;
    let countYellow = 0;
    formGreen.addEventListener('click', () => {
        //Si el contador es menor que 1, carga el formulario y aumenta el contador para que no se pueda volver a cargar despues de los clicks que se hagan sobre los campos del formulario
        if (countGreen < 1) {
            loadForm(formGreen);
            countGreen++;
        }
    });
    formYellow.addEventListener('click', () => {
        //Si el contador es menor que 1, carga el formulario y aumenta el contador para que no se pueda volver a cargar despues de los clicks que se hagan sobre los campos del formulario
        if (countYellow < 1) {
            loadForm(formYellow);
            countYellow++;
        }
    });
})();
