// Game logic for Snakes and Ladders
export class Game {
  constructor(playerCount = 2, playerNames = []) {
    this.playerCount = playerCount;
    this.playerNames = playerNames.length > 0 ? playerNames : Array.from({length: playerCount}, (_, i) => `Player ${i + 1}`);
    this.currentPlayer = 1;
    this.playerPositions = {};
    
    // Initialize player positions at 0 (before board starts)
    for (let i = 1; i <= playerCount; i++) {
      this.playerPositions[i] = 0;
    }
    
    this.gameActive = true;
    this.isAnimating = false;
    
    // Snakes: key = head position, value = tail position
    this.snakes = {
      17: 4,
      54: 31,
      62: 19,
      87: 36,
      93: 73,
      99: 79,
    };
    
    // Ladders: key = bottom position, value = top position
    this.ladders = {
      2: 38,
      7: 14,
      8: 31,
      21: 42,
      28: 84,
      51: 67,
      72: 91,
      78: 98,
    };
  }

  rollDice() {
    if (!this.gameActive || this.isAnimating) return null;
    return Math.floor(Math.random() * 6) + 1;
  }

  movePlayer(diceValue) {
    if (!this.gameActive || this.isAnimating) return null;

    this.isAnimating = true;
    
    const currentPosition = this.playerPositions[this.currentPlayer];
    
    let newPosition = currentPosition + diceValue;
    
    // Bounce back if exceeding 100
    if (newPosition > 100) {
      const excess = newPosition - 100;
      newPosition = 100 - excess;
    }
    
    // Check for snake or ladder
    let message = '';
    if (this.snakes[newPosition]) {
      const tailPos = this.snakes[newPosition];
      message = `🐍 Snake! Slid from ${newPosition} to ${tailPos}`;
      newPosition = tailPos;
    } else if (this.ladders[newPosition]) {
      const topPos = this.ladders[newPosition];
      message = `🪜 Ladder! Climbed from ${newPosition} to ${topPos}`;
      newPosition = topPos;
    } else {
      message = `Moved to ${newPosition}`;
    }

    this.playerPositions[this.currentPlayer] = newPosition;

    // Check for winner
    if (newPosition === 100) {
      this.gameActive = false;
      message = `🎉 ${this.playerNames[this.currentPlayer - 1]} WINS! 🎉`;
    }

    return {
      position: newPosition,
      message: message,
      gameOver: !this.gameActive,
    };
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer >= this.playerCount ? 1 : this.currentPlayer + 1;
  }

  resetGame() {
    this.currentPlayer = 1;
    for (let i = 1; i <= this.playerCount; i++) {
      this.playerPositions[i] = 0;
    }
    this.gameActive = true;
    this.isAnimating = false;
  }

  getGameState() {
    return {
      currentPlayer: this.currentPlayer,
      playerPositions: this.playerPositions,
      playerNames: this.playerNames,
      playerCount: this.playerCount,
      gameActive: this.gameActive,
      isAnimating: this.isAnimating,
    };
  }
}
