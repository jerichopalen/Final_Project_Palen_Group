import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Scene3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 50, 100);

    // Sizes
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Camera - Orthographic for perfect flat view with no perspective distortion
    const width = this.sizes.width;
    const height = this.sizes.height;
    const aspectRatio = width / height;
    // Sized to fit the board in the center white square area
    const visibleWidth = 5.2 * aspectRatio;
    const visibleHeight = 5.2;
    this.camera = new THREE.OrthographicCamera(
      -visibleWidth,
      visibleWidth,
      visibleHeight,
      -visibleHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 5, 0);
    this.scene.add(this.camera);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enabled = false; // Disable drag interaction

    // Lights
    this.setupLights();

    // Game objects
    this.boardMesh = null;
    this.dices = [];
    this.tokens = [];
    this.snakeMeshes = [];
    this.ladderMeshes = [];

    // Clock
    this.clock = new THREE.Clock();

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    // Point light for atmosphere
    const pointLight = new THREE.PointLight(0xff6b6b, 0.5, 50);
    pointLight.position.set(-10, 10, 10);
    this.scene.add(pointLight);
  }

  createBoard(snakes, ladders) {
    // Create board group
    const boardGroup = new THREE.Group();

    // Board base with gradient
    const boardGeometry = new THREE.PlaneGeometry(10, 10);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a4d2e,
      roughness: 0.8,
      metalness: 0.1,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.receiveShadow = true;
    board.position.z = -0.1;
    boardGroup.add(board);

    // Create squares with enhanced colors
    const squareSize = 1;
    let squareNum = 1;

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        // Calculate position using same logic as getSquarePosition
        let x;
        if (row % 2 === 0) {
          // Even row: left to right
          x = col - 4.5;
        } else {
          // Odd row: right to left
          x = 4.5 - col;
        }
        
        // Flip vertically: row 0 at bottom
        const y = row - 4.5;

        // Enhanced alternating colors - more vibrant
        const isEven = (row + col) % 2 === 0;
        const squareColor = isEven ? 0xf5f5dc : 0xdeb887;

        const squareGeom = new THREE.PlaneGeometry(squareSize * 0.95, squareSize * 0.95);
        const squareMat = new THREE.MeshStandardMaterial({
          color: squareColor,
          roughness: 0.7,
          metalness: 0.05,
        });
        const square = new THREE.Mesh(squareGeom, squareMat);
        square.position.set(x, y, 0);
        square.userData.squareNumber = squareNum;
        boardGroup.add(square);

        // Add number text using canvas texture
        this.addSquareNumber(boardGroup, squareNum, x, y);

        squareNum++;
      }
    }

    // Draw snakes
    for (const [head, tail] of Object.entries(snakes)) {
      this.drawSnake(boardGroup, parseInt(head), parseInt(tail));
    }

    // Draw ladders
    for (const [bottom, top] of Object.entries(ladders)) {
      this.drawLadder(boardGroup, parseInt(bottom), parseInt(top));
    }

    this.scene.add(boardGroup);
    this.boardMesh = boardGroup;
  }

  addSquareNumber(boardGroup, squareNum, x, y) {
    // Create canvas texture for number with beautiful design
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 90);
    gradient.addColorStop(0, '#FFE082');
    gradient.addColorStop(1, '#FFA726');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(64, 64, 58, 0, Math.PI * 2);
    context.fill();
    
    // Add outer ring
    context.strokeStyle = '#FF6F00';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(64, 64, 58, 0, Math.PI * 2);
    context.stroke();
    
    // Add inner lighter circle
    context.strokeStyle = '#FFEB3B';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(64, 64, 50, 0, Math.PI * 2);
    context.stroke();
    
    // Number text with shadow effect
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.shadowBlur = 8;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 70px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(squareNum.toString(), 64, 70);
    
    const texture = new THREE.CanvasTexture(canvas);
    const numberGeometry = new THREE.PlaneGeometry(0.6, 0.6);
    const numberMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.set(x, y, 0.02);
    boardGroup.add(numberMesh);
  }

  drawSnake(boardGroup, headSquare, tailSquare) {
    const headPos = this.getSquarePosition(headSquare);
    const tailPos = this.getSquarePosition(tailSquare);

    // Create a wavy snake path
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(headPos.x, headPos.y, 0.08),
      new THREE.Vector3((headPos.x + tailPos.x) / 2, (headPos.y + tailPos.y) / 2, 0.3),
      new THREE.Vector3(tailPos.x, tailPos.y, 0.08)
    );

    const points = curve.getPoints(40);
    
    // Add snake head (red sphere at start)
    const headGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      metalness: 0.3,
      roughness: 0.5,
      emissive: 0x660000
    });
    const snakeHead = new THREE.Mesh(headGeometry, headMaterial);
    snakeHead.position.copy(points[0]);
    snakeHead.castShadow = true;
    snakeHead.receiveShadow = true;
    boardGroup.add(snakeHead);

    // Add menacing yellow eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffff00,
      emissive: 0xffff00
    });
    const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye1.position.copy(points[0]);
    eye1.position.z += 0.15;
    eye1.position.x -= 0.06;
    boardGroup.add(eye1);

    const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye2.position.copy(points[0]);
    eye2.position.z += 0.15;
    eye2.position.x += 0.06;
    boardGroup.add(eye2);

    // Add wavy body segments along the path
    const segmentCount = 8;
    for (let i = 1; i < segmentCount; i++) {
      const t = i / segmentCount;
      const pointIndex = Math.floor(t * (points.length - 1));
      const segPos = points[pointIndex];

      const segGeometry = new THREE.SphereGeometry(0.1 - (i * 0.005), 6, 6);
      const segMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff2222,
        metalness: 0.2,
        roughness: 0.6
      });
      const segment = new THREE.Mesh(segGeometry, segMaterial);
      segment.position.copy(segPos);
      segment.castShadow = true;
      boardGroup.add(segment);
    }
  }

  drawLadder(boardGroup, bottomSquare, topSquare) {
    const bottomPos = this.getSquarePosition(bottomSquare);
    const topPos = this.getSquarePosition(topSquare);

    // Ladder parameters
    const sideDistance = 0.22;
    const rungs = 10;
    
    // Calculate the actual distance between squares
    const dx = topPos.x - bottomPos.x;
    const dy = topPos.y - bottomPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Create ladder group
    const ladderGroup = new THREE.Group();

    // Create left side rail (thick wooden beam)
    const railGeometry = new THREE.CylinderGeometry(0.06, 0.06, distance, 8);
    const railMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B6F47,
      metalness: 0.3,
      roughness: 0.7
    });
    
    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(
      (bottomPos.x + topPos.x) / 2 - sideDistance * Math.cos(angle + Math.PI / 2),
      (bottomPos.y + topPos.y) / 2 - sideDistance * Math.sin(angle + Math.PI / 2),
      0.2
    );
    leftRail.rotation.z = angle + Math.PI / 2;
    leftRail.castShadow = true;
    leftRail.receiveShadow = true;
    ladderGroup.add(leftRail);

    // Create right side rail (thick wooden beam)
    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(
      (bottomPos.x + topPos.x) / 2 + sideDistance * Math.cos(angle + Math.PI / 2),
      (bottomPos.y + topPos.y) / 2 + sideDistance * Math.sin(angle + Math.PI / 2),
      0.2
    );
    rightRail.rotation.z = angle + Math.PI / 2;
    rightRail.castShadow = true;
    rightRail.receiveShadow = true;
    ladderGroup.add(rightRail);

    // Create rungs (steps) - wooden horizontal bars - VISIBLE STEPS
    const rungGeometry = new THREE.CylinderGeometry(0.08, 0.08, sideDistance * 2.4, 8);
    const rungMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xD2B48C,
      metalness: 0.4,
      roughness: 0.6
    });

    for (let i = 0; i < rungs; i++) {
      const t = i / (rungs - 1);
      const rungPos = new THREE.Vector3(
        bottomPos.x + t * dx,
        bottomPos.y + t * dy,
        0.2
      );

      const rung = new THREE.Mesh(rungGeometry, rungMaterial);
      rung.position.copy(rungPos);
      // Rotate perpendicular to the ladder direction
      rung.rotation.z = angle;
      rung.castShadow = true;
      rung.receiveShadow = true;
      ladderGroup.add(rung);
    }

    boardGroup.add(ladderGroup);
  }

  getSquarePosition(squareNumber) {
    squareNumber = Math.max(1, Math.min(100, squareNumber));
    const squareIndex = squareNumber - 1;
    const row = Math.floor(squareIndex / 10);
    const col = squareIndex % 10;

    // Zigzag pattern: even rows go left->right, odd rows go right->left
    let x;
    if (row % 2 === 0) {
      // Even row (0, 2, 4, ...): left to right
      x = col - 4.5;
    } else {
      // Odd row (1, 3, 5, ...): right to left
      x = 4.5 - col;
    }

    // Flip vertically: row 0 at bottom, row 9 at top
    const y = row - 4.5;

    return {
      x: x,
      y: y,
    };
  }

  createToken(playerNumber) {
    const geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
    
    // Player colors: Red, Blue, Green, Orange/Yellow - Vibrant versions
    const colors = [0xe74c3c, 0x3498db, 0x27ae60, 0xf39c12];
    const color = colors[playerNumber - 1] || colors[0];
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.6,
      roughness: 0.3,
    });
    const token = new THREE.Mesh(geometry, material);
    token.castShadow = true;
    token.receiveShadow = true;
    token.userData.playerNumber = playerNumber;
    token.userData.squareNumber = 0;

    this.scene.add(token);
    this.tokens.push(token);
    return token;
  }

  createDice() {
    const diceGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.3,
    });
    const dice = new THREE.Mesh(geometry, material);
    dice.castShadow = true;
    dice.receiveShadow = true;
    diceGroup.add(dice);

    // Add dots to each face (1-6)
    const dotGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const dotMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const dotPositions = [
      // Face 1 (top, +Z): 1 dot center
      [[0, 0, 0.15]],
      // Face 2 (bottom, -Z): 2 dots
      [[-0.05, -0.05, -0.15], [0.05, 0.05, -0.15]],
      // Face 3 (right, +X): 3 dots diagonal
      [[0.15, -0.05, -0.05], [0.15, 0, 0], [0.15, 0.05, 0.05]],
      // Face 4 (left, -X): 4 dots corners
      [[-0.15, -0.05, -0.05], [-0.15, 0.05, -0.05], [-0.15, -0.05, 0.05], [-0.15, 0.05, 0.05]],
      // Face 5 (front, +Y): 5 dots X pattern
      [[0, 0.15, 0], [-0.05, 0.15, -0.05], [0.05, 0.15, 0.05], [-0.05, 0.15, 0.05], [0.05, 0.15, -0.05]],
      // Face 6 (back, -Y): 6 dots 2x3 grid
      [[-0.05, -0.15, -0.05], [0.05, -0.15, -0.05], [-0.05, -0.15, 0], [0.05, -0.15, 0], [-0.05, -0.15, 0.05], [0.05, -0.15, 0.05]],
    ];

    dotPositions.forEach((positions) => {
      positions.forEach((pos) => {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(pos[0], pos[1], pos[2]);
        diceGroup.add(dot);
      });
    });

    diceGroup.castShadow = true;
    diceGroup.receiveShadow = true;
    diceGroup.position.set(6, 5, 1);

    this.scene.add(diceGroup);
    this.dices.push(diceGroup);
    return diceGroup;
  }

  // Get offset position for token if multiple tokens on same square
  getTokenOffset(playerNumber, totalPlayersOnSquare) {
    const offsets = [
      { x: -0.2, y: -0.2 }, // Player 1 - bottom left
      { x: 0.2, y: -0.2 },  // Player 2 - bottom right
      { x: -0.2, y: 0.2 },  // Player 3 - top left
      { x: 0.2, y: 0.2 },   // Player 4 - top right
    ];
    
    if (totalPlayersOnSquare <= 1) {
      return { x: 0, y: 0 };
    }
    
    return offsets[playerNumber - 1] || { x: 0, y: 0 };
  }

  moveToken(token, toSquare, duration = 0.5) {
    return new Promise((resolve) => {
      const currentSquare = token.userData.squareNumber || 0;
      
      console.log(`moveToken called: from ${currentSquare} to ${toSquare}`);
      
      // If no movement needed, resolve immediately
      if (toSquare <= currentSquare) {
        console.log(`No movement needed.`);
        resolve();
        return;
      }

      let currentMoveSquare = currentSquare;
      const stepDelay = 600; // 0.6 seconds between each step
      
      const moveNextSquare = async () => {
        if (currentMoveSquare >= toSquare) {
          console.log(`Movement complete at square ${token.userData.squareNumber}`);
          resolve();
          return;
        }

        currentMoveSquare++;
        console.log(`Moving to square ${currentMoveSquare}`);
        
        const fromPos = token.position.clone();
        const targetPos = this.getSquarePosition(currentMoveSquare);
        targetPos.z = 0.2;

        // Animate this single square movement
        await new Promise((stepResolve) => {
          const startTime = Date.now();
          let animating = true;

          const animate = () => {
            if (!animating) return;

            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            token.position.x = fromPos.x + (targetPos.x - fromPos.x) * easeProgress;
            token.position.y = fromPos.y + (targetPos.y - fromPos.y) * easeProgress;
            token.position.z = 0.2 + Math.sin(progress * Math.PI) * 0.1;

            if (progress >= 1) {
              token.position.copy(targetPos);
              token.userData.squareNumber = currentMoveSquare;
              animating = false;
              stepResolve();
            } else {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        });

        // Wait before moving to next square
        await new Promise((delayResolve) => setTimeout(delayResolve, stepDelay));
        
        // Move to next square
        moveNextSquare();
      };

      moveNextSquare();
    });
  }

  // Animate ladder climb
  animateLadderClimb(token, fromSquare, toSquare, duration = 1) {
    return new Promise((resolve) => {
      const fromPos = this.getSquarePosition(fromSquare);
      const toPos = this.getSquarePosition(toSquare);
      const startTime = Date.now();

      console.log(`🪜 Climbing ladder from square ${fromSquare} to ${toSquare}`);

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out - slower at start, faster at end
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        token.position.x = fromPos.x + (toPos.x - fromPos.x) * easeProgress;
        token.position.y = fromPos.y + (toPos.y - fromPos.y) * easeProgress;
        token.position.z = 0.2 + Math.sin(progress * Math.PI * 2) * 0.15; // Climbing bounce

        if (progress >= 1) {
          token.position.copy(toPos);
          token.position.z = 0.2;
          token.userData.squareNumber = toSquare;
          console.log(`✅ Reached top of ladder at square ${toSquare}`);
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };

      animate();
    });
  }

  // Animate snake slide
  animateSnakeSlide(token, fromSquare, toSquare, duration = 1) {
    return new Promise((resolve) => {
      const fromPos = this.getSquarePosition(fromSquare);
      const toPos = this.getSquarePosition(toSquare);
      const startTime = Date.now();

      console.log(`🐍 Sliding down snake from square ${fromSquare} to ${toSquare}`);

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in - fast at start, slower at end
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        token.position.x = fromPos.x + (toPos.x - fromPos.x) * easeProgress;
        token.position.y = fromPos.y + (toPos.y - fromPos.y) * easeProgress;
        token.position.z = 0.2 + Math.cos(progress * Math.PI) * 0.2; // Falling arc

        if (progress >= 1) {
          token.position.copy(toPos);
          token.position.z = 0.2;
          token.userData.squareNumber = toSquare;
          console.log(`💥 Hit ground at square ${toSquare}`);
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };

      animate();
    });
  }

  rollDiceAnimation(dice) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = 0.5;
      const finalValue = Math.floor(Math.random() * 6) + 1;

      // Dice face rotations - which face shows on top (+Y direction)
      const faceRotations = {
        1: { x: 0, y: 0, z: 0 },                              // Top face (1)
        2: { x: Math.PI / 2, y: 0, z: 0 },                    // Front face (2)
        3: { x: 0, y: Math.PI / 2, z: 0 },                    // Right face (3)
        4: { x: 0, y: -Math.PI / 2, z: 0 },                   // Left face (4)
        5: { x: 0, y: 0, z: -Math.PI / 2 },                   // Bottom rotated (5)
        6: { x: Math.PI, y: 0, z: 0 },                        // Back face (6)
      };

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = elapsed / duration;

        dice.rotation.x += 0.3;
        dice.rotation.y += 0.3;
        dice.rotation.z += 0.3;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Set final rotation to show the correct face
          const targetRotation = faceRotations[finalValue];
          dice.rotation.set(targetRotation.x, targetRotation.y, targetRotation.z);
          resolve(finalValue);
        }
      };

      animate();
    });
  }

  onWindowResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    // Update orthographic camera to fit board in center area
    const aspectRatio = this.sizes.width / this.sizes.height;
    const visibleWidth = 5.2 * aspectRatio;
    const visibleHeight = 5.2;
    this.camera.left = -visibleWidth;
    this.camera.right = visibleWidth;
    this.camera.top = visibleHeight;
    this.camera.bottom = -visibleHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    const tick = () => {
      this.render();
      requestAnimationFrame(tick);
    };
    tick();
  }
}
