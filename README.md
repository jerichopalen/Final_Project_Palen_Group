# 🎲 3D Snakes & Ladders Game

## Project Overview

A modern, interactive 3D implementation of the classic Snakes and Ladders board game built with **Three.js**, **Vite**, and **WebGL**. This project demonstrates full-stack web development with immersive 3D graphics, real-time animations, and engaging user interactions.

### 🎯 Key Features
- **3D Game Board**: Beautiful 3D visualization of the 10×10 board with interactive squares
- **Animated Token Movement**: Smooth step-by-step movement through each square
- **Bounce-back Mechanics**: When a player exceeds 100, the token bounces back step-by-step
- **Snake & Ladder Animations**: Visual animations showing snakes sliding down and ladders climbing up
- **Multi-player Support**: Play with 2-4 players with custom names
- **Sound Effects**: Audio feedback for dice rolls, movements, snakes, ladders, and wins
- **Responsive Design**: Works across different screen sizes and devices
- **Game Statistics**: Real-time position tracking for all players

---

## 📋 Development Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | Vanilla JavaScript (ES6+) |
| **3D Graphics** | Three.js (v0.182.0) |
| **Build Tool** | Vite (v7.2.4) |
| **Module System** | ES Modules |
| **Styling** | CSS3 |
| **Audio** | Web Audio API |
| **Deployment** | Vercel / GitHub Pages |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jerichopalen/Final_Project_Palen_Group.git
   cd Final_Project_Palen_Group/three-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` in your browser

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
Final_Project/
├── three-game/
│   ├── src/
│   │   ├── main.js           # Main game logic and event handlers
│   │   ├── Game.js           # Game state management
│   │   ├── Scene3D.js        # Three.js 3D scene management
│   │   ├── SoundManager.js   # Audio effects controller
│   │   ├── counter.js        # Utility counter component
│   │   └── style.css         # Global styling
│   ├── public/               # Static assets
│   ├── index.html            # HTML entry point
│   ├── package.json          # Project dependencies
│   └── vite.config.js        # Vite build configuration
├── README.md                 # This file
└── .git/                     # Git version control
```

---

## 🎮 How to Play

1. **Setup**: Enter the number of players (2-4) and their names
2. **Roll Dice**: Click the "Roll Dice" button to roll
3. **Watch Animation**: See your token move step-by-step across the board
4. **Bounce Back**: If you exceed 100, watch as your token bounces back smoothly
5. **Snakes & Ladders**: Land on a snake and slide down, or on a ladder and climb up
6. **Win**: First player to reach exactly 100 wins!

### Game Rules
- Players take turns rolling the dice
- Move forward by the number shown on the dice
- If you land on the head of a snake, slide down to its tail
- If you land on the bottom of a ladder, climb up to its top
- If your move exceeds 100, bounce back (e.g., 97+5 = 102 → bounce to 98)
- First player to reach exactly 100 wins the game

---

## 👥 Team Roles & Responsibilities

| Team Member | Role | Responsibilities |
|------------|------|------------------|
| **PALEN (Leader)** | Project Lead & Backend | • Project management and coordination<br>• Game logic implementation (Game.js)<br>• State management<br>• Deployment to Vercel<br>• Integration of all components |
| **MATCHICA DAVE** | 3D Graphics Developer | • Three.js scene management (Scene3D.js)<br>• 3D board and token creation<br>• Animation systems (bounce, snake, ladder)<br>• Camera and lighting setup<br>• WebGL optimization |
| **BONGCAC** | Frontend & Audio Developer | • UI/UX design and implementation<br>• HTML structure (index.html)<br>• CSS styling and responsive design<br>• Sound effects management (SoundManager.js)<br>• Event handling and user interactions |

---

## 🛠️ Technical Details

### Game Logic (Game.js)
- Player position tracking
- Dice roll generation (1-6)
- Snake and ladder definitions
- Bounce-back calculation
- Win condition checking
- Game state management

### 3D Rendering (Scene3D.js)
- Three.js scene, camera, and renderer setup
- 10×10 board grid generation
- Interactive square highlighting
- Token 3D models with colors per player
- Animated token movement between squares
- Snake sliding animations
- Ladder climbing animations
- Dice 3D model with rolling animation

### Animation System
- **Step-by-step Movement**: Tokens move through each square individually (100ms per square)
- **Bounce-back Animation**: Forward to 100, then backward to bounce position
- **Snake/Ladder Effects**: Smooth transitions with dramatic animations
- **Dice Rolling**: 3D dice tumbling animation with random results

### Sound Effects
- 🎲 Dice roll sound
- 🪙 Coin/step sound for each square
- 🐍 Snake sliding sound effect
- 🪜 Ladder climbing sound effect
- 🏆 Champion/winner celebration sound

---

## 📦 Deployment

### Deploy to Vercel
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set **Root Directory** to `./three-game`
4. Vercel will auto-deploy on every push

### Deploy to GitHub Pages
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to GitHub Pages

**Current Deployment**: [Live Demo](https://your-vercel-deployment-url.com)

---

## 🎨 Customization

### Add New Snakes & Ladders
Edit `Game.js`:
```javascript
this.snakes = {
  17: 4,
  54: 31,
  // Add more: position -> tail
};

this.ladders = {
  2: 38,
  7: 14,
  // Add more: bottom -> top
};
```

### Adjust Animation Speed
Edit `main.js`, change the setTimeout delay:
```javascript
await new Promise(resolve => setTimeout(resolve, 100)); // Milliseconds per square
```

### Change Colors & Styling
Edit `style.css` and `Scene3D.js` to modify colors, fonts, and visual themes

---

## 🐛 Known Issues & Future Enhancements

### Current Status
- ✅ Fully functional 2-4 player gameplay
- ✅ 3D animations with smooth transitions
- ✅ Sound effects system
- ✅ Responsive UI
- ✅ Production-ready deployment

### Future Enhancements
- [ ] AI opponent mode
- [ ] Leaderboard/score tracking
- [ ] More game themes and visual styles
- [ ] Mobile touch controls
- [ ] Replay/save game functionality
- [ ] Multiplayer online mode
- [ ] Mobile app version

---

## 📝 License

This project is created for educational purposes as part of the Final Project assignment.

---

## 📞 Contact & Support

For questions or issues, please reach out to the development team:
- **Project Repository**: https://github.com/jerichopalen/Final_Project_Palen_Group
- **Live Demo**: https://final-project-palen-group.vercel.app

---

## 🎓 Learning Outcomes

This project demonstrates proficiency in:
- ✅ 3D graphics programming with Three.js
- ✅ Full-stack JavaScript development
- ✅ Game development concepts
- ✅ Object-oriented programming
- ✅ Event-driven architecture
- ✅ Asynchronous programming (async/await)
- ✅ Web Audio API integration
- ✅ Build tool configuration (Vite)
- ✅ Version control (Git)
- ✅ Deployment and DevOps

---

**Last Updated**: December 31, 2025  
**Version**: 1.0.0
