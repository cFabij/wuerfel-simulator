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

    // Für mehrere Würfel: Generiere echte Zufallskombination
    return this.generateValidDiceCombination(maxNumber, diceCount);
  }

  /**
   * Neue, verbesserte Methode für echte Zufallsverteilung
   */
  generateValidDiceCombination(maxNumber, diceCount) {
    const minSum = diceCount; // Minimum: alle Würfel zeigen 1
    const maxSum = diceCount * 6; // Maximum: alle Würfel zeigen 6
    
    // Begrenze das Ziel auf mögliche Werte
    const actualMaxNumber = Math.min(maxNumber, maxSum);
    const targetSum = Math.floor(Math.random() * (actualMaxNumber - minSum + 1)) + minSum;
    
    // Generiere alle möglichen Kombinationen für diese Summe
    const validCombinations = this.getAllValidCombinations(targetSum, diceCount);
    
    // Wähle zufällig eine Kombination aus
    const randomIndex = Math.floor(Math.random() * validCombinations.length);
    return validCombinations[randomIndex];
  }

  /**
   * Generiert alle möglichen Würfel-Kombinationen für eine gegebene Summe
   */
  getAllValidCombinations(targetSum, diceCount) {
    const combinations = [];
    
    // Rekursive Funktion zum Generieren aller Kombinationen
    const generateCombinations = (remaining, diceLeft, currentCombo) => {
      if (diceLeft === 0) {
        if (remaining === 0) {
          combinations.push([...currentCombo]);
        }
        return;
      }
      
      // Für jeden möglichen Würfel-Wert (1-6)
      for (let value = 1; value <= 6; value++) {
        const newRemaining = remaining - value;
        const minPossible = diceLeft - 1; // Minimum für verbleibende Würfel
        const maxPossible = (diceLeft - 1) * 6; // Maximum für verbleibende Würfel
        
        // Prüfe, ob diese Kombination noch möglich ist
        if (newRemaining >= minPossible && newRemaining <= maxPossible) {
          currentCombo.push(value);
          generateCombinations(newRemaining, diceLeft - 1, currentCombo);
          currentCombo.pop();
        }
      }
    };
    
    generateCombinations(targetSum, diceCount, []);
    return combinations;
  }

  /**
   * Alternative, performantere Methode für große Würfel-Anzahlen
   */
  generateValidDiceCombinationFast(maxNumber, diceCount) {
    const minSum = diceCount;
    const maxSum = Math.min(maxNumber, diceCount * 6);
    const targetSum = Math.floor(Math.random() * (maxSum - minSum + 1)) + minSum;
    
    // Beginne mit zufälligen Werten für jeden Würfel
    const result = [];
    for (let i = 0; i < diceCount; i++) {
      result[i] = Math.floor(Math.random() * 6) + 1;
    }
    
    // Adjustiere die Werte, um die Zielsumme zu erreichen
    let currentSum = result.reduce((a, b) => a + b, 0);
    let attempts = 0;
    const maxAttempts = 100;
    
    while (currentSum !== targetSum && attempts < maxAttempts) {
      const difference = targetSum - currentSum;
      
      if (difference > 0) {
        // Wir brauchen mehr - finde einen Würfel, der erhöht werden kann
        const candidates = [];
        for (let i = 0; i < diceCount; i++) {
          if (result[i] < 6) candidates.push(i);
        }
        if (candidates.length > 0) {
          const randomIndex = candidates[Math.floor(Math.random() * candidates.length)];
          const increase = Math.min(difference, 6 - result[randomIndex]);
          result[randomIndex] += increase;
        }
      } else {
        // Wir haben zu viel - finde einen Würfel, der reduziert werden kann
        const candidates = [];
        for (let i = 0; i < diceCount; i++) {
          if (result[i] > 1) candidates.push(i);
        }
        if (candidates.length > 0) {
          const randomIndex = candidates[Math.floor(Math.random() * candidates.length)];
          const decrease = Math.min(-difference, result[randomIndex] - 1);
          result[randomIndex] -= decrease;
        }
      }
      
      currentSum = result.reduce((a, b) => a + b, 0);
      attempts++;
    }
    
    // Falls wir die exakte Summe nicht erreichen konnten, verwende Fallback
    if (currentSum !== targetSum) {
      return this.fallbackDistribution(targetSum, diceCount);
    }
    
    // Mische das Array für zusätzliche Zufälligkeit
    return this.shuffleArray(result);
  }

  /**
   * Fallback für seltene Fälle
   */
  fallbackDistribution(targetSum, diceCount) {
    const result = new Array(diceCount).fill(1);
    let remaining = targetSum - diceCount;
    
    while (remaining > 0) {
      const availableIndices = result
        .map((val, idx) => val < 6 ? idx : -1)
        .filter(idx => idx !== -1);
      
      if (availableIndices.length === 0) break;
      
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const maxIncrease = Math.min(remaining, 6 - result[randomIndex]);
      result[randomIndex] += maxIncrease;
      remaining -= maxIncrease;
    }
    
    return this.shuffleArray(result);
  }

  /**
   * Mischt ein Array zufällig
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

// Initialisiere die Anwendung
document.addEventListener("DOMContentLoaded", () => {
  new DiceSimulator();
});
