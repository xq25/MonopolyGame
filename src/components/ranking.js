// Función para cargar y mostrar el ranking en la tabla
export function cargarRanking() {
    fetch("http://127.0.0.1:5000/ranking")
        .then(response => response.json())
        .then(users => {
            const bodyRanking = document.getElementById("bodyRanking");
            if (!bodyRanking) return;
            bodyRanking.innerHTML = ""; // Limpiar contenido previo

            users.forEach(usuario => {
                bodyRanking.innerHTML += `
                    <tr>
                        <td>
                            <div class="pais-cell">
                                <img src="https://flagsapi.com/${usuario.country_code.toUpperCase()}/shiny/64.png" 
                            </div>
                        </td>
                        <td>${usuario.nick_name}</td>
                        <td><span class="score">${formatScore(usuario.score)}</span></td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error("Error al obtener el ranking:", error);
            const bodyRanking = document.getElementById("bodyRanking");
            if (bodyRanking) {
                bodyRanking.innerHTML = `<tr><td colspan="3" class="error-message">⚠️ No se pudo cargar el ranking.</td></tr>`;
            }
        });
}

// Función auxiliar para formatear el puntaje con comas
function formatScore(score) {
    return parseInt(score).toLocaleString();
}