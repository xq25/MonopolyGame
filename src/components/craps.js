function initCraps(
  rollButtonId = "rollButton",
  crap1Id = "crap1",
  crap2Id = "crap2",
  resultId = "result",
  manualCrap1Id = "manualCrap1",
  manualCrap2Id = "manualCrap2",
) {
  const rollButton = document.getElementById(rollButtonId);
  const crap1 = document.getElementById(crap1Id);
  const crap2 = document.getElementById(crap2Id);
  const result = document.getElementById(resultId);
  const manualCrap1 = document.getElementById(manualCrap1Id);
  const manualCrap2 = document.getElementById(manualCrap2Id);

  // El contenedor principal del popup (ajusta el id según tu HTML)
  // const popup = result.closest('.crap-section') || result.parentElement;
  let response = null;

  if (!rollButton || !crap1 || !crap2 || !result || !manualCrap1 || !manualCrap2) return;

  const crapPatterns = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  function drawcrap(crapElement, number) {
    crapElement.innerHTML = "";
    for (let i = 1; i <= 9; i++) {
      const cell = document.createElement("div");
      if (crapPatterns[number].includes(i)) {
        cell.classList.add("pip");
      }
      crapElement.appendChild(cell);
    }
  }

  rollButton.addEventListener("click", () => {
    
    let roll1 = parseInt(manualCrap1.value, 10);
    let roll2 = parseInt(manualCrap2.value, 10);

    const isManual1 = !isNaN(roll1);
    const isManual2 = !isNaN(roll2);

    if (!isManual1) roll1 = Math.floor(Math.random() * 6) + 1;
    if (!isManual2) roll2 = Math.floor(Math.random() * 6) + 1;

    const total = roll1 + roll2;
    if (manualCrap1.value.trim() === "" && manualCrap2.value.trim() === "") {
      drawcrap(crap1, roll1);
      drawcrap(crap2, roll2);
    }
    
    if (isManual1 || isManual2) {
      result.textContent = `Movimiento manual: ${roll1} + ${roll2} = ${total}`;
    } else {
      result.textContent = `Sacaste: ${roll1} + ${roll2} = ${total}`;
    }

    crap1.classList.add("animate");
    crap2.classList.add("animate");
    result.classList.add("animate");

    // Mostrar el popup
    // if (popup) popup.style.display = "block";

    setTimeout(() => {
      crap1.classList.remove("animate");
      crap2.classList.remove("animate");
      result.classList.remove("animate");
    }, 500);
    // setTimeout(() => {
    //   if (popup) popup.style.display = "none";
    // }, 2000); // Ocultar después de 2 segundos en caso de que no se haya ocultado ya  
    document.dispatchEvent(new CustomEvent('diceRolled', { detail: total })); // Disparamos el evento personalizado con el total de la tirada
    console.log(`Tirada de dados: ${total}`);
    //rollButton.disabled = false;
  });
  
}
export { initCraps };