function cargarRanking() {
        fetch("http://127.0.0.1:5000/ranking")
            .then(response => response.json())
            .then(users => {
                console.log(users);
                const bodyRanking = document.getElementById("bodyRanking");
                bodyRanking.innerHTML = ""; // Limpiar contenido previo
                users.forEach(usuario => {
                    bodyRanking.innerHTML +=`
                    <tr id="usuario-${usuario.id}">
                        <td><img src="https://flagsapi.com/${usuario.country_code.toUpperCase()}/shiny/64.png"></td>
                        <td>${usuario.nick_name}</td>
                        <td>${usuario.score}</td>
                    </tr>
                    `
                });
            })
            .catch(error => console.error("Error al obtener los usuarios:", error));
    }