function showCraps(crapAreaId = "crapArea") {
  const crapArea = document.getElementById(crapAreaId);
  if (crapArea) crapArea.style.display = "block";
}

function hideCraps(crapsAreaId = "crapsArea") {
  const crapsArea = document.getElementById(crapsAreaId);
  if (crapsArea) crapsArea.style.display = "none";
}

function initCraps(
  rollButtonId = "rollButton",
  crap1Id = "crap1",
  crap2Id = "crap2",
  resultId = "result",
  manualcrap1Id = "manualcrap1",
  manualcrap2Id = "manualcrap2",
  onRoll = null // Nuevo parámetro: callback
) {
  const rollButton = document.getElementById(rollButtonId);
  const crap1 = document.getElementById(crap1Id);
  const crap2 = document.getElementById(crap2Id);
  const result = document.getElementById(resultId);
  const manualcrap1 = document.getElementById(manualcrap1Id);
  const manualcrap2 = document.getElementById(manualcrap2Id);

  if (!rollButton || !crap1 || !crap2 || !result || !manualcrap1 || !manualcrap2) return;

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
    let roll1 = parseInt(manualcrap1.value, 10);
    let roll2 = parseInt(manualcrap2.value, 10);

    const isManual1 = manualcrap1.value.trim() !== "" && !isNaN(roll1) && roll1 >= 1 && roll1 <= 6;
    const isManual2 = manualcrap2.value.trim() !== "" && !isNaN(roll2) && roll2 >= 1 && roll2 <= 6;

    if (!isManual1) roll1 = Math.floor(Math.random() * 6) + 1;
    if (!isManual2) roll2 = Math.floor(Math.random() * 6) + 1;

    const total = roll1 + roll2;

    drawcrap(crap1, roll1);
    drawcrap(crap2, roll2);

    if (isManual1 || isManual2) {
      result.textContent = `Movimiento manual: ${roll1} + ${roll2} = ${total}`;
    } else {
      result.textContent = `Sacaste: ${roll1} + ${roll2} = ${total}`;
    }

    crap1.classList.add("animate");
    crap2.classList.add("animate");
    result.classList.add("animate");

    setTimeout(() => {
      crap1.classList.remove("animate");
      crap2.classList.remove("animate");
      result.classList.remove("animate");
    }, 600);

    // Llama al callback si existe
    if (typeof onRoll === "function") {
      onRoll({ roll1, roll2, total });
    }
  });
}
export { showCraps, hideCraps, initCraps };