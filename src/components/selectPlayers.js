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

    // ---- Seleccion de los formularios de los jugadores por su ID ----
    const formRed = document.getElementById('form-red');
    const formBlue = document.getElementById('form-blue');
    const formGreen = document.getElementById('form-green');
    const formYellow = document.getElementById('form-yellow');
    //Seleccion de los iconos "+" para cargar los formularios de el jugador amarillo y verde.
    const iconYellow = document.getElementById('addPlayer-yellow');
    const iconGreen = document.getElementById('addPlayer-green');
    const readyBtn = document.getElementById('readyToPlay');
    
    // ---- Variables mutables para verificacion o carga de elementos ----
    let countriesList = []; //Aqui van a ir almacenados nuestros paises para ser reutilizados.
    let activeForms = 0 //Cada que carguemos un nuevo formulario aumentamos su numero y cada que se cierre lo disminuimos para poder validar que todos los formularios esten bien diligenciados para empezar el juego.
    
    //Funcion para cargar los paises dentro del select correspondiente de cada formulario.
    function loadCountries(elementSelector){ //Utilizamos nuestra variable countriesList para cargar todos los select de los formularios.
        countriesList.forEach(country => {
            const option = document.createElement('option');
            option.value = Object.keys(country)[0]; // Usamos el código del país como valor, Que en este caso es la key de cada json
            option.textContent = Object.values(country)[0]; // Mostramos el nombre del país
            elementSelector.appendChild(option);
        });
    }

    // Función para cargar el formulario de un jugador en el div correspondiente.
    function loadForm(elementForm) {
        fetch('/src/pages/formUser.html')
            .then(response => response.text()) //Convertimos nuestra pagina en un string para poder agregarlo mediante innertHTML
            .then(html => {
                elementForm.innerHTML = html; // Insertamos el HTML del formulario en el div correspondiente (formRed, formBlue, etc.)
                const countrySelect = elementForm.querySelector('.countries-selector'); // Seleccionamos el select del formulario insertado que deberia de existir al momento de cargarlo.
                const closeBtn = elementForm.querySelector('.close-btn')
                activeForms ++ //Cada vez que se cargue un formulario aumentamos la variable.

                if (countrySelect) { //Protegemos con un if por si no se encuentra el select, para evitar errores
                    loadCountries(countrySelect); // Cargamos los países en el select del formulario insertado
                }
                //Para los formularios (form-red y form-blue) No se puede mostrar la opcion de cerrar el formulario. Por defecto siempre deben estar cargados(Esto nos define el numero minimo de jugadores)
                if (elementForm.id === 'form-red' || elementForm.id === 'form-blue'){
                    closeBtn.style.display = 'none'
                }
                else{
                    //Para el resto de los botones debemos verificaar si los clickean para cerrar el formulario
                    closeBtn.addEventListener('click', () => {
                        closeForm(elementForm)
                    });
                } 
            });
    }

    //Funcion para cerrar un formulario al darle al boton "x".
    function closeForm(elementForm){
        let inyeccion = ``
        activeForms -- //Cada que se active la funcion para cerrar un formulario disminuimos la variable.
        //Debemo evaluar cual formulario estamso cerrando, para asi crear nuevamente su icono de agregacion correspondiente
        if (elementForm.id === 'form-yellow'){
            inyeccion = `<div class="addIcon" id="addPlayer-yellow">+</div>` //Icono "+" de agregacion respectivo para el formulario del jugador amarillo.
        }
        else{
            inyeccion = `<div class="addIcon" id="addPlayer-green">+</div>` //Icono "+" de agregacion respectivo para el formulario del jugador verde.
        }

        //Agregamos el icono de agregacion correspondiente al formulario cerrado y lo volvemos a guardar en una constante
        //Ya que al momento de cargar el formulario, las referencias anteriores se eliminaron (Verificar con felipe)
        elementForm.innerHTML = inyeccion;
        const newIcon = elementForm.querySelector('.addIcon');

        if (elementForm.id === 'form-yellow') {
            newIcon.addEventListener('click', () => {
                loadForm(elementForm);
            });
        }else {
            newIcon.addEventListener('click', () => {
                loadForm(elementForm);
            });
        }
    }

    //Funcion para salvar o guardar la informacion valida de cada formulario.
    function getPlayerData(formElement) {
        const userForm = formElement.querySelector('.formPlayers'); //Esta clase del elemento es unica para referenciar el formulario cargado (Osea que hay un usuario posible para el juego)
        let response = null
        //Verificamsos si existe un formulario con datos del jugador; Sino no devuelve nada 
        if (userForm){
            // Extrae los valores de los campos (ajusta los nombres según tu formUser.html)
            const nickName = userForm.querySelector('input')?.value.trim() || ''; //Si existe algun elemento input dentro de nuestro formulario, le extraemos su valor
            const country = userForm.querySelector('.countries-selector')?.value || '';//Si existe algun elemento que pertenezca a la clase countries-selector, le extraemos su valor seleccionado
            
            response = { 
                color: formElement.id.replace('form-', ''),
                nickName,
                country
            };

        } 
        return playerDataRestriccions(response, formElement)?response: null; //Si la informacion es valida la rescatamos en un Objeto.
    }

    //Funcion para garantizar la informacion valida de cada formulario.
    function playerDataRestriccions(data, formElement){
        
        let nameValidation = true;
        let countryValidation = true;

        //Validamos que el formulario este activo.
        if (data !== null){
            //Extraemos el div que esta destinado para mostrar el error que implica no seleccionar o no rellenar un campo
            const errorDivSelect = formElement.querySelector('.error-select');
            const errorDivInput = formElement.querySelector('.error-input');

            //Limpiamos el div para mostrar el error. Ya que esto nos permite que si la informacion se corrige, se deje de mostrar el error
            errorDivInput.textContent = '';
            errorDivSelect.textContent = '';
            if (data.nickName  === '' ){
                //Si no se ingresa un nickName
                const inputCamp = formElement.querySelector('input');
                
                if (inputCamp) {
                    errorDivInput.textContent = 'Ingresa un nickname!!'; //Mostramos el error en el campo correspondiente
                }
                nameValidation = false;
            }
            if (data.country === ''){
                //Si no se selecciona un pais
                const selectCamp = formElement.querySelector('.countries-selector');
                if (selectCamp) {
                    errorDivSelect.textContent = 'Elige un país!!';//Mostramos el error en el campo correspondiente
                }
                countryValidation = false;
            }
            

        }
        return (nameValidation && countryValidation) //Solo si todos los campos estan diligenciados se devuelve true.
        
    }

    // Carga los formularios de los jugadores rojo y azul (*por defecto siempre estan cargados).
    function basicLoadForm(){
        loadForm(formRed);
        loadForm(formBlue);
    }

    //Encapsulamos toda la carga de los formularios despues de que nuestra variable countriesList contenga toda la informacion para el select de los formularios.
    //Asi nos aseguramos que ningun campo se quede sin su respectiva carga de paises.
    fetch('http://127.0.0.1:5000/countries')
        .then(response => response.json()).then(data => {
            countriesList = data;
        
        basicLoadForm(); //Cargamos los formularios de los jugadores rojo y azul (por defecto)
        iconGreen.addEventListener('click', () => {
            loadForm(formGreen);
        });
        iconYellow.addEventListener('click', () => {
            loadForm(formYellow);
        });
    });
    readyBtn.addEventListener('click', () => {
        const infoPlayers = []; //En esta constante se va a guardar toda la informacion de los usuarios que tengan toda su informacion valida para jugar
        const formularios = [formRed, formBlue, formYellow, formGreen];
        formularios.forEach(formElement => {
            //Por cada formulario debemos validar si tiene informacion (activo o inactivo).
            const formData = getPlayerData(formElement);
            if (formData !== null){
                //Si hay contenido valido y completo en el formulario lo guardamos en nuestra constante
                infoPlayers.push(formData);
            }
            
        });
        if(infoPlayers.length === activeForms){ //Validamos que todos los formularios activos esten bien diligenciados para empezar el juego.
            //Creamos e invocamos un customEvent que va a ser escuchado desde nuestro index, en el cual pasaremos la informacion de los usuarios para empezar a trabajarla desde alli.
            document.dispatchEvent(new CustomEvent('playersReady', {detail: infoPlayers}));
        }

        //Se podria mostrar un mensaje de alerta general para que se revise bien los formularios y captar la atencion sobre los campos sin diligenciar.
    });
})();
