document.addEventListener("DOMContentLoaded", () => {
  const rollButton = document.getElementById("rollButton");
  const dice1 = document.getElementById("dice1");
  const dice2 = document.getElementById("dice2");
  const result = document.getElementById("result");
  const diceContainer = document.getElementById("diceContainer");
  const manualDice1 = document.getElementById("manualDice1");
  const manualDice2 = document.getElementById("manualDice2");

  const dicePatterns = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  function drawDice(diceElement, number) {
    diceElement.innerHTML = "";
    for (let i = 1; i <= 9; i++) {
      const cell = document.createElement("div");
      if (dicePatterns[number].includes(i)) {
        cell.classList.add("pip");
      }
      diceElement.appendChild(cell);
    }
  }

  rollButton.addEventListener("click", () => {
    // Verificar si los inputs manuales tienen valores válidos
    let roll1 = parseInt(manualDice1.value, 10);
    let roll2 = parseInt(manualDice2.value, 10);

    const isManual1 = !isNaN(roll1) && roll1 >= 1 && roll1 <= 6;
    const isManual2 = !isNaN(roll2) && roll2 >= 1 && roll2 <= 6;

    if (!isManual1) {
      roll1 = Math.floor(Math.random() * 6) + 1;
    }
    if (!isManual2) {
      roll2 = Math.floor(Math.random() * 6) + 1;
    }

    const total = roll1 + roll2;

    drawDice(dice1, roll1);
    drawDice(dice2, roll2);

    if (isManual1 || isManual2) {
      result.textContent = `Movimiento manual: ${roll1} + ${roll2} = ${total}`;
    } else {
      result.textContent = `Sacaste: ${roll1} + ${roll2} = ${total}`;
    }

    dice1.classList.add("animate");
    dice2.classList.add("animate");
    result.classList.add("animate");

    setTimeout(() => {
      dice1.classList.remove("animate");
      dice2.classList.remove("animate");
      result.classList.remove("animate");
    }, 600);
  });
});