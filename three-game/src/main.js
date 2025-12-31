import './style.css';
import { Game } from './Game.js';
import { Scene3D } from './Scene3D.js';
import { SoundManager } from './SoundManager.js';

// Initialize game and 3D scene
let game = new Game(2, ['Player 1', 'Player 2']);
const canvas = document.querySelector('canvas.webgl');
const scene3D = new Scene3D(canvas);
const soundManager = new SoundManager();

// Create game board with snakes and ladders
scene3D.createBoard(game.snakes, game.ladders);

// Create player tokens at starting position (position 0, before board)
const token1 = scene3D.createToken(1);
token1.userData.squareNumber = 0; // Start at position 0
token1.visible = false; // Hide initially
const token2 = scene3D.createToken(2);
token2.userData.squareNumber = 0; // Start at position 0
token2.visible = false; // Hide initially
const tokenMap = { 1: token1, 2: token2 }; // Map player numbers to tokens

// Create dice
const dice = scene3D.createDice();

// Update token positions - spread them out when on same square
function updateTokenPositions() {
  const state = game.getGameState();
  
  // Count players on each square
  const squareOccupancy = {};
  for (let i = 1; i <= state.playerCount; i++) {
    const square = state.playerPositions[i];
    if (!squareOccupancy[square]) {
      squareOccupancy[square] = [];
    }
    squareOccupancy[square].push(i);
  }
  
  // Update each token position with offset if multiple on same square
  for (let i = 1; i <= state.playerCount; i++) {
    const token = tokenMap[i];
    if (!token) continue;
    
    const square = state.playerPositions[i];
    const playersOnSquare = squareOccupancy[square];
    
    let tokenX, tokenY;
    
    if (square === 0) {
      // Position 0 - inside square 1 area, spread out (2 left, 2 right)
      const square1Pos = scene3D.getSquarePosition(1);
      const offsets = [
        { x: -0.15, y: -0.15 },  // Player 1 - left bottom
        { x: -0.15, y: 0.15 },   // Player 2 - left top
        { x: 0.15, y: -0.15 },   // Player 3 - right bottom
        { x: 0.15, y: 0.15 },    // Player 4 - right top
      ];
      const offset = offsets[i - 1] || { x: 0, y: 0 };
      tokenX = square1Pos.x + offset.x;
      tokenY = square1Pos.y + offset.y;
    } else {
      // Normal squares - apply offset if multiple players
      const basePos = scene3D.getSquarePosition(square);
      let offsetX = 0, offsetY = 0;
      
      if (playersOnSquare.length > 1) {
        const offsets = [
          { x: -0.2, y: -0.2 }, // Player 1 - bottom left
          { x: 0.2, y: -0.2 },  // Player 2 - bottom right
          { x: -0.2, y: 0.2 },  // Player 3 - top left
          { x: 0.2, y: 0.2 },   // Player 4 - top right
        ];
        const offset = offsets[i - 1] || { x: 0, y: 0 };
        offsetX = offset.x;
        offsetY = offset.y;
      }
      
      tokenX = basePos.x + offsetX;
      tokenY = basePos.y + offsetY;
    }
    
    token.position.x = tokenX;
    token.position.y = tokenY;
    token.position.z = 0.2;
  }
}

// Update UI
function updateUI() {
  const state = game.getGameState();
  const container = document.getElementById('playersContainer');
  container.innerHTML = '';
  
  for (let i = 1; i <= state.playerCount; i++) {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player-info' + (state.currentPlayer === i ? ' current-player' : '');
    playerDiv.id = `player${i}Info`;
    
    const colors = ['#e74c3c', '#3498db', '#27ae60', '#f39c12'];
    const colorEmoji = ['🔴', '🔵', '🟢', '🟡'];
    
    playerDiv.innerHTML = `
      <p class="player-name" style="color: ${colors[i-1]};">${colorEmoji[i-1]} ${state.playerNames[i-1]}</p>
      <p>Position: <span id="p${i}Pos">${state.playerPositions[i]}</span> <span style="color: #888;">/</span> <span style="color: ${colors[i-1]};">100</span></p>
    `;
    container.appendChild(playerDiv);
  }
}

// Global roll dice function
window.rollDice = async function() {
  const diceValue = game.rollDice();
  if (diceValue === null) return;

  const rollButton = document.getElementById('rollButton');
  rollButton.disabled = true;

  // Update dice display with emoji
  const diceDisplay = document.getElementById('diceValue');
  
  // Animate dice roll and get the actual rolled value
  const rolledValue = await scene3D.rollDiceAnimation(dice);
  console.log(`🎲 Dice rolled: ${rolledValue}`);
  
  // Show dice emoji with number
  const diceEmojis = ['', '🎲', '🎲', '🎲', '🎲', '🎲', '🎲'];
  diceDisplay.textContent = `${diceEmojis[rolledValue]} ${rolledValue}`;

  // Get current player's token BEFORE moving
  const currentPlayer = game.currentPlayer;
  const token = tokenMap[currentPlayer];
  const currentPlayerName = game.playerNames[currentPlayer - 1];
  
  const tokenCurrentSquare = token.userData.squareNumber;
  console.log(`Token at square: ${tokenCurrentSquare}, Player ${currentPlayer} (${currentPlayerName})`);

  // Move player (using the actual rolled value from dice animation)
  const result = game.movePlayer(rolledValue);
  console.log(`Move result - Position: ${result.position}, Message: ${result.message}`);

  // Calculate landing square before any snake/ladder effects
  let landingSquare = tokenCurrentSquare + rolledValue;
  
  // Handle bounce-back - move step by step
  if (landingSquare > 100) {
    const excess = landingSquare - 100;
    const bounceBackSquare = 100 - excess;
    
    // Move step-by-step to 100
    console.log(`Bounce-back detected: moving step-by-step to 100`);
    for (let sq = tokenCurrentSquare + 1; sq <= 100; sq++) {
      soundManager.playCoinSound();
      await scene3D.moveToken(token, sq);
    }
    
    // Move step-by-step back from 100 to bounce position
    for (let sq = 99; sq >= bounceBackSquare; sq--) {
      soundManager.playCoinSound();
      await scene3D.moveToken(token, sq);
    }
    
    landingSquare = bounceBackSquare;
  } else {
    // Normal movement - move step-by-step to landing square
    if (result.message.includes('Snake') || result.message.includes('Ladder')) {
      // Move step-by-step to snake head or ladder base
      console.log(`Moving step-by-step to ${landingSquare}`);
      for (let sq = tokenCurrentSquare + 1; sq <= landingSquare; sq++) {
        soundManager.playCoinSound();
        await scene3D.moveToken(token, sq);
      }
    } else {
      // Regular move without snake/ladder - move step-by-step
      console.log(`Moving step-by-step from ${tokenCurrentSquare} to ${result.position} (${rolledValue} squares)`);
      for (let sq = tokenCurrentSquare + 1; sq <= result.position; sq++) {
        soundManager.playCoinSound();
        await scene3D.moveToken(token, sq);
      }
      landingSquare = result.position;
    }
  }

  // Animate snake slide or ladder climb at final position
  if (result.message.includes('Snake')) {
    console.log(`Animating snake slide from ${landingSquare} to ${result.position}`);
    soundManager.playSnakeSound();
    await scene3D.animateSnakeSlide(token, landingSquare, result.position, 1);
  } else if (result.message.includes('Ladder')) {
    console.log(`Animating ladder climb from ${landingSquare} to ${result.position}`);
    soundManager.playLadderSound();
    await scene3D.animateLadderClimb(token, landingSquare, result.position, 1);
  }

  // Update token positions to avoid overlap
  updateTokenPositions();

  // Only show game result messages (snake/ladder/win)
  const gameStatus = document.getElementById('gameStatus');
  gameStatus.textContent = result.message;

  // Reset animation flag
  game.isAnimating = false;

  if (result.gameOver) {
    rollButton.disabled = true;
    soundManager.playChampionSound(); // Play winner sound
    // Show winner modal with actual player name
    const winnerModal = document.getElementById('winnerModal');
    const winnerText = document.getElementById('winnerText');
    winnerText.textContent = `🎉 ${currentPlayerName} WINS! 🎉`;
    winnerModal.classList.add('show');
  } else {
    game.switchPlayer();
    updateUI();
    rollButton.disabled = false;
  }
};

// Global setup function
window.showSetup = function() {
  const setupPanel = document.getElementById('setupPanel');
  const setupContent = document.getElementById('setupContent');
  setupContent.style.display = setupContent.style.display === 'none' ? 'block' : 'none';
};

// Update player input fields based on player count
window.updatePlayerInputs = function() {
  const playerCount = parseInt(document.getElementById('playerCount').value);
  const container = document.getElementById('playerNamesContainer');
  container.innerHTML = '';
  
  for (let i = 1; i <= playerCount; i++) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.innerHTML = `
      <label>Player ${i} Name:</label>
      <input type="text" id="playerName${i}" placeholder="Enter name" value="Player ${i}">
    `;
    container.appendChild(formGroup);
  }
};

// Start game with player setup
window.startGame = function() {
  const playerCount = parseInt(document.getElementById('playerCount').value);
  const playerNames = [];
  
  for (let i = 1; i <= playerCount; i++) {
    const nameInput = document.getElementById(`playerName${i}`);
    playerNames.push(nameInput.value || `Player ${i}`);
  }
  
  // Reinitialize game
  game = new Game(playerCount, playerNames);
  
  // Reset tokens
  Object.keys(tokenMap).forEach(key => {
    scene3D.scene.remove(tokenMap[key]);
  });
  
  // Create new tokens for all players
  for (let i = 1; i <= playerCount; i++) {
    const token = scene3D.createToken(i);
    token.userData.squareNumber = 0; // Start at position 0
    tokenMap[i] = token;
  }
  
  // Position all tokens at square 0 (spread out)
  updateTokenPositions();
  
  // Hide setup panel
  document.getElementById('setupContent').style.display = 'none';
  document.getElementById('gameUI').style.display = 'block';
  
  // Update UI
  updateUI();
};

// Global reset function
window.resetGame = function() {
  console.log('Resetting game...');
  game.resetGame();
  
  // Reset dice display
  const diceDisplay = document.getElementById('diceValue');
  diceDisplay.textContent = '🎲 -';
  
  // Reset all tokens to starting position (position 0) and hide them
  for (let i = 1; i <= game.playerCount; i++) {
    if (tokenMap[i]) {
      tokenMap[i].userData.squareNumber = 0;
      tokenMap[i].visible = false; // Hide tokens
    }
  }
  
  // Update positions
  updateTokenPositions();
  
  // Reset status message
  document.getElementById('gameStatus').textContent = 'Game reset! Click Roll Dice to start!';
  
  // Hide winner modal
  const winnerModal = document.getElementById('winnerModal');
  winnerModal.classList.remove('show');
  
  // Reset button
  document.getElementById('rollButton').disabled = false;
  
  // Update UI
  updateUI();
  console.log('Game reset complete!');
};

// Start animation loop
scene3D.animate();

// Initial setup - hide game UI and show setup panel
document.getElementById('gameUI').style.display = 'none';
document.getElementById('setupContent').style.display = 'block';
updatePlayerInputs(); // Initialize player name inputs
