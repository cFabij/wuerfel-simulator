class DiceSimulator {
  constructor() {
    this.maxNumberInput = document.getElementById("maxNumber");
    this.rollButton = document.getElementById("rollButton");
    this.resultNumber = document.getElementById("resultNumber");
    this.resultText = document.getElementById("resultText");
    this.diceContainer = document.getElementById("diceContainer");

    this.currentDice = [];
    this.isRolling = false;

    this.initializeEventListeners();
    this.initializeDice();
  }

  initializeEventListeners() {
    this.rollButton.addEventListener("click", () => this.rollDice());
    this.maxNumberInput.addEventListener("input", () => this.updateDice());
  }

  initializeDice() {
    this.updateDice();
  }

  updateDice() {
    const maxNumber = parseInt(this.maxNumberInput.value) || 6;
    const requiredDice = this.calculateRequiredDice(maxNumber);

    this.clearDice();
    this.createDice(requiredDice);
    this.setInitialResult();
  }

  calculateRequiredDice(maxNumber) {
    return Math.ceil(maxNumber / 6);
  }

  clearDice() {
    this.diceContainer.innerHTML = "";
    this.currentDice = [];
  }

  createDice(count) {
    for (let i = 0; i < count; i++) {
      const dice = this.createSingleDice();
      this.diceContainer.appendChild(dice);
      this.currentDice.push(dice);
    }
  }

  createSingleDice() {
  const dice = document.createElement("div");
  dice.className = "dice";

  const faces = ["front", "back", "right", "left", "top", "bottom"];
  const numbers = [1, 6, 3, 4, 2, 5];

  faces.forEach((face, index) => {
    const faceElement = document.createElement("div");
    faceElement.className = `dice-face ${face}`;
    faceElement.setAttribute("data-number", numbers[index]);
    
    // Erstelle die entsprechende Anzahl von Punkten
    for (let i = 0; i < numbers[index]; i++) {
      const dot = document.createElement("div");
      dot.className = "dice-dot";
      faceElement.appendChild(dot);
    }
    
    dice.appendChild(faceElement);
  });

  return dice;
}

  setInitialResult() {
    this.resultNumber.textContent = "1";
    this.resultText.textContent = "Wählen Sie eine Zahl und klicken Sie auf 'Würfeln'";
  }

  async rollDice() {
    if (this.isRolling) return;

    const maxNumber = parseInt(this.maxNumberInput.value) || 6;
    
    if (maxNumber < 1) {
      alert("Bitte geben Sie eine Zahl größer als 0 ein.");
      return;
    }

    this.isRolling = true;
    this.rollButton.disabled = true;
    this.resultText.textContent = "Würfel rollen...";

    // Generiere Zufallsergebnis
    const result = this.generateRandomResult(maxNumber);
    
    // Starte Animation
    await this.animateDice(result);

    // Zeige Ergebnis
    this.showResult(result, maxNumber);

    this.isRolling = false;
    this.rollButton.disabled = false;
  }

  generateRandomResult(maxNumber) {
    const diceCount = this.currentDice.length;
    
    if (diceCount === 1) {
      return [Math.floor(Math.random() * maxNumber) + 1];
    }

    // Für mehrere Würfel: Generiere Kombination, die zum Ziel passt
    const targetSum = Math.floor(Math.random() * maxNumber) + 1;
    return this.distributeSumOverDice(targetSum, diceCount);
  }

  distributeSumOverDice(targetSum, diceCount) {
    const result = new Array(diceCount).fill(1);
    let remainingSum = targetSum - diceCount; // Subtract minimum (1 per dice)

    // Verteile die verbleibende Summe zufällig
    for (let i = 0; i < remainingSum; i++) {
      const diceIndex = Math.floor(Math.random() * diceCount);
      if (result[diceIndex] < 6) {
        result[diceIndex]++;
      } else {
        // Finde anderen Würfel
        const availableIndex = result.findIndex(val => val < 6);
        if (availableIndex !== -1) {
          result[availableIndex]++;
        }
      }
    }

    return result;
  }

  async animateDice(finalResults) {
    // Starte Roll-Animation für alle Würfel
    this.currentDice.forEach(dice => {
      dice.classList.add("rolling");
    });

    // Warte auf Animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Stoppe Animation und setze Endposition
    this.currentDice.forEach((dice, index) => {
      dice.classList.remove("rolling");
      this.setDiceFinalPosition(dice, finalResults[index]);
    });
  }

  setDiceFinalPosition(dice, finalNumber) {
    // Rotationen für jede Zahl (um die richtige Seite oben zu zeigen)
    const rotations = {
      1: "rotateX(0deg) rotateY(0deg)",
      2: "rotateX(-90deg) rotateY(0deg)",
      3: "rotateX(0deg) rotateY(-90deg)",
      4: "rotateX(0deg) rotateY(90deg)",
      5: "rotateX(90deg) rotateY(0deg)",
      6: "rotateX(180deg) rotateY(0deg)"
    };

    dice.style.transform = rotations[finalNumber];
  }

  showResult(results, maxNumber) {
    const sum = results.reduce((a, b) => a + b, 0);
    
    this.resultNumber.textContent = sum;
    
    if (results.length === 1) {
      this.resultText.textContent = `Würfel zeigt: ${sum}`;
    } else {
      const diceValues = results.join(" + ");
      this.resultText.textContent = `Würfel zeigen: ${diceValues} = ${sum}`;
    }
  }
}



// Initialisiere die Anwendung
document.addEventListener("DOMContentLoaded", () => {
  new DiceSimulator();
});