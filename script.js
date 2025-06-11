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

    // Verwende echte Würfel-Simulation mit Rejection Sampling
    return this.generateTrulyRandomDice(maxNumber, diceCount);
  }

  /**
   * Echte Würfel-Simulation: Jeder Würfel wird unabhängig gewürfelt
   * Rejection Sampling bis gültiges Ergebnis gefunden wird
   */
  generateTrulyRandomDice(maxNumber, diceCount) {
    const maxAttempts = 10000;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      // Würfle jeden Würfel völlig unabhängig
      const result = [];
      for (let i = 0; i < diceCount; i++) {
        result.push(Math.floor(Math.random() * 6) + 1);
      }
      
      const sum = result.reduce((a, b) => a + b, 0);
      
      // Akzeptiere nur Ergebnisse im gültigen Bereich
      if (sum >= 1 && sum <= maxNumber) {
        return result;
      }
      
      attempts++;
    }
    
    // Fallback für extrem seltene Fälle
    console.warn("Fallback verwendet - das sollte sehr selten passieren");
    return this.generateConstrainedRandomDice(maxNumber, diceCount);
  }

  /**
   * Fallback-Methode: Intelligente Constraint-basierte Verteilung
   * Nur verwendet, wenn Rejection Sampling fehlschlägt
   */
  generateConstrainedRandomDice(maxNumber, diceCount) {
    // Wähle eine Zielzahl zwischen den möglichen Grenzen
    const minPossible = Math.max(1, diceCount); // Minimum ist diceCount, aber mindestens 1
    const maxPossible = Math.min(maxNumber, diceCount * 6);
    
    // Gleichmäßige Verteilung über den gültigen Bereich
    const targetSum = Math.floor(Math.random() * (maxPossible - minPossible + 1)) + minPossible;
    
    // Verwende Dirichlet-ähnliche Verteilung für faire Aufteilung
    return this.distributeSum(targetSum, diceCount);
  }

  /**
   * Verteilung einer Summe auf Würfel mit möglichst natürlicher Zufälligkeit
   * Jeder Würfel hat eine faire Chance auf jeden Wert
   */
  distributeSum(targetSum, diceCount) {
    // Erstelle eine Liste aller möglichen Würfel-Werte
    const allPossibleValues = [];
    for (let i = 0; i < diceCount; i++) {
      allPossibleValues.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Sortiere für bessere Verteilung
    allPossibleValues.sort(() => Math.random() - 0.5);
    
    // Normalisiere auf Zielsumme
    const currentSum = allPossibleValues.reduce((a, b) => a + b, 0);
    const ratio = targetSum / currentSum;
    
    // Skaliere und runde intelligent
    const result = allPossibleValues.map(val => {
      const scaled = val * ratio;
      return Math.max(1, Math.min(6, Math.round(scaled)));
    });
    
    // Feinabstimmung für exakte Summe
    let actualSum = result.reduce((a, b) => a + b, 0);
    let adjustmentAttempts = 0;
    
    while (actualSum !== targetSum && adjustmentAttempts < 100) {
      const difference = targetSum - actualSum;
      
      if (difference > 0) {
        // Erhöhe einen zufälligen Würfel
        const candidatesUp = result
          .map((val, idx) => val < 6 ? idx : -1)
          .filter(idx => idx !== -1);
        
        if (candidatesUp.length > 0) {
          const randomIdx = candidatesUp[Math.floor(Math.random() * candidatesUp.length)];
          const increase = Math.min(difference, 6 - result[randomIdx]);
          result[randomIdx] += increase;
        }
      } else {
        // Reduziere einen zufälligen Würfel
        const candidatesDown = result
          .map((val, idx) => val > 1 ? idx : -1)
          .filter(idx => idx !== -1);
        
        if (candidatesDown.length > 0) {
          const randomIdx = candidatesDown[Math.floor(Math.random() * candidatesDown.length)];
          const decrease = Math.min(-difference, result[randomIdx] - 1);
          result[randomIdx] -= decrease;
        }
      }
      
      actualSum = result.reduce((a, b) => a + b, 0);
      adjustmentAttempts++;
    }
    
    // Finales Mischen für zusätzliche Zufälligkeit
    return this.shuffleArray(result);
  }

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
