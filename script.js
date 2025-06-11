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

    const result = this.generateRandomResult(maxNumber);
    
    await this.animateDice(result);
    this.showResult(result, maxNumber);

    this.isRolling = false;
    this.rollButton.disabled = false;
  }

  generateRandomResult(maxNumber) {
    const diceCount = this.currentDice.length;
    
    if (diceCount === 1) {
      return [Math.floor(Math.random() * maxNumber) + 1];
    }

    return this.generateEfficientDiceCombination(maxNumber, diceCount);
  }

  /**
   * Hocheffiziente Methode für Würfel-Kombinationen
   * Laufzeit: O(n) statt O(6^n)
   */
  generateEfficientDiceCombination(maxNumber, diceCount) {
    // Bestimme die Zielzahl
    const minPossible = diceCount;
    const maxPossible = Math.min(maxNumber, diceCount * 6);
    const targetSum = Math.floor(Math.random() * (maxPossible - minPossible + 1)) + minPossible;
    
    // Initialisiere alle Würfel mit 1
    const result = new Array(diceCount).fill(1);
    let remainingSum = targetSum - diceCount;
    
    // Verteile die verbleibende Summe zufällig
    while (remainingSum > 0) {
      // Wähle zufälligen Würfel
      const diceIndex = Math.floor(Math.random() * diceCount);
      
      // Bestimme, wie viel wir hinzufügen können
      const maxAdd = Math.min(remainingSum, 6 - result[diceIndex]);
      
      if (maxAdd > 0) {
        // Füge zufällige Menge hinzu (1 bis maxAdd)
        const addAmount = Math.floor(Math.random() * maxAdd) + 1;
        result[diceIndex] += addAmount;
        remainingSum -= addAmount;
      }
    }
    
    // Mische die Reihenfolge für zusätzliche Zufälligkeit
    return this.shuffleArray(result);
  }

  /**
   * Alternative Methode: Direkte Würfel-Simulation
   * Simuliert echtes Würfeln bis gültiges Ergebnis
   */
  generateRealisticDiceCombination(maxNumber, diceCount) {
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (attempts < maxAttempts) {
      // Würfle jeden Würfel einzeln
      const result = [];
      for (let i = 0; i < diceCount; i++) {
        result.push(Math.floor(Math.random() * 6) + 1);
      }
      
      const sum = result.reduce((a, b) => a + b, 0);
      
      // Prüfe, ob das Ergebnis gültig ist
      if (sum <= maxNumber) {
        return result;
      }
      
      attempts++;
    }
    
    // Fallback: Verwende effiziente Methode
    return this.generateEfficientDiceCombination(maxNumber, diceCount);
  }

  /**
   * Mischt Array in O(n) Zeit
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async animateDice(finalResults) {
    this.currentDice.forEach(dice => {
      dice.classList.add("rolling");
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    this.currentDice.forEach((dice, index) => {
      dice.classList.remove("rolling");
      this.setDiceFinalPosition(dice, finalResults[index]);
    });
  }

  setDiceFinalPosition(dice, finalNumber) {
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

document.addEventListener("DOMContentLoaded", () => {
  new DiceSimulator();
});
