// Player class and related functionality
class Player {
    constructor(x, y) {
        this.x = x || Math.random() * window.innerWidth;
        this.y = y || Math.random() * window.innerHeight;
        this.rotation = 0;
        this.health = 100;
        this.kills = 0;
        this.coins = 0;
        this.attacking = false;
        this.inventory = {
            skin: 'default',
            stick: 'default',
            battlepass: false
        };
        
        // Create DOM elements
        this.createElement();
    }
    
    createElement() {
        // Create player element
        this.element = document.createElement('div');
        this.element.className = 'player';
        this.element.style.backgroundImage = 'url("assets/images/player-character.svg")';
        this.element.style.zIndex = '5'; // Ensure player is above other elements
        camera.worldContainer.appendChild(this.element);
        
        // Create player stick
        this.stickElement = document.createElement('div');
        this.stickElement.className = 'stick';
        this.stickElement.style.backgroundImage = 'url("assets/images/stick-weapon.svg")';
        this.element.appendChild(this.stickElement);
    }
    
    move(direction) {
        const speed = 10; // Increased from 5 to 10 for faster movement
        let newX = this.x;
        let newY = this.y;
        
        if (direction === 'up') newY -= speed;
        if (direction === 'left') newX -= speed;
        if (direction === 'down') newY += speed;
        if (direction === 'right') newX += speed;
        
        // Keep player within bounds
        newX = Math.max(0, Math.min(window.innerWidth - 30, newX));
        newY = Math.max(0, Math.min(window.innerHeight - 50, newY));
        
        // Check for obstacle collisions
        if (environment && !environment.checkObstacleCollisions(this, newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }
    
    rotate(mouseX, mouseY) {
        // Calculate rotation based on mouse position
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.rotation = Math.atan2(dy, dx);
    }
    
    attack() {
        if (this.attacking) return;
        
        this.attacking = true;
        
        // Store current rotation for attack animation
        this.element.style.setProperty('--rotation', `${this.rotation}rad`);
        
        // Add attacking class to the stick element specifically
        this.stickElement.classList.add('attacking');
        
        // Call the global function to check for hits
        setTimeout(() => {
            // Check for hits at the moment the stick is extended (75% through animation)
            checkAttacks();
        }, 150); // 150ms is approximately 50% through our 300ms animation
        
        // Reset attacking state and remove class after animation completes
        setTimeout(() => {
            this.attacking = false;
            this.stickElement.classList.remove('attacking');
        }, 300);
    }
    
    updateAppearance() {
        // Update appearance based on inventory
        if (this.inventory.skin === 'premium') {
            this.element.classList.add('premium-item');
            // Add a glow effect or other visual indicator
            this.element.style.filter = 'drop-shadow(0 0 5px gold)';
        } else {
            this.element.classList.remove('premium-item');
            this.element.style.filter = 'none';
        }
        
        if (this.inventory.stick === 'premium') {
            // Change to premium stick image
            this.stickElement.style.backgroundImage = 'url("assets/images/premium-stick.svg")';
            this.stickElement.classList.add('premium-item');
        } else {
            this.stickElement.style.backgroundImage = 'url("assets/images/stick-weapon.svg")';
            this.stickElement.classList.remove('premium-item');
        }
    }
    
    update() {
        // Update position
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Update stick position and rotation (now positioned at the right hand)
        this.stickElement.style.transform = `rotate(${this.rotation}rad)`;
        this.stickElement.style.transformOrigin = '0 center';
        
        // Position stick at the player's right hand
        this.stickElement.style.left = '28px';
        this.stickElement.style.top = '32px';
    }
}

// Set up keyboard and mouse controls
function setupPlayerControls() {
    document.addEventListener('mousemove', (e) => {
        // Convert screen coordinates to world coordinates
        const worldCoords = camera.screenToWorld(e.clientX, e.clientY);
        player.rotate(worldCoords.x, worldCoords.y);
    });
    
    // Track which keys are currently pressed
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false
    };
    
    // Key down handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'w') keys.w = true;
        if (e.key === 'a') keys.a = true;
        if (e.key === 's') keys.s = true;
        if (e.key === 'd') keys.d = true;
    });
    
    // Key up handler
    document.addEventListener('keyup', (e) => {
        if (e.key === 'w') keys.w = false;
        if (e.key === 'a') keys.a = false;
        if (e.key === 's') keys.s = false;
        if (e.key === 'd') keys.d = false;
    });
    
    // Process movement continuously for smoother controls
    setInterval(() => {
        if (keys.w) player.move('up');
        if (keys.a) player.move('left');
        if (keys.s) player.move('down');
        if (keys.d) player.move('right');
    }, 16); // Approximately 60fps
    
    document.addEventListener('mousedown', () => {
        player.attack();
    });
}

// Function to check for attacks and hits
function checkAttacks() {
    if (!player.attacking) return;
    
    const playerRadius = 15;
    const stickRange = 70; // Increased from 40 to 70 for easier hits
    
    otherPlayers.forEach(otherPlayer => {
        if (otherPlayer.health <= 0) return;
        
        // Calculate distance between player and other player
        const dx = otherPlayer.x - player.x;
        const dy = otherPlayer.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if the stick can hit the other player based on distance and angle
        const angleDiff = Math.abs(Math.atan2(dy, dx) - player.rotation);
        if (distance < playerRadius + stickRange && angleDiff < 1.0) { // Increased angle tolerance from 0.5 to 1.0
            // Hit! Reduce health and check for defeat
            otherPlayer.health -= 20;
            
            // Visual feedback for hit
            const otherPlayerElement = document.getElementById(otherPlayer.id);
            if (otherPlayerElement) {
                otherPlayerElement.classList.add('hit');
                setTimeout(() => {
                    otherPlayerElement.classList.remove('hit');
                }, 300);
                
                // Add knockback effect
                otherPlayerElement.style.setProperty('--knockback-x', `${Math.cos(player.rotation) * 15}px`);
                otherPlayerElement.style.setProperty('--knockback-y', `${Math.sin(player.rotation) * 15}px`);
                otherPlayerElement.classList.add('knockback');
                setTimeout(() => {
                    otherPlayerElement.classList.remove('knockback');
                }, 300);
            }
            
            // Create impact effect
            createImpactEffect(otherPlayer.x, otherPlayer.y);
            
            // Show damage text
            showFloatingText('-20', otherPlayer.x + 15, otherPlayer.y - 10, '#FF0000');
            
            if (otherPlayer.health <= 0) {
                // Player defeated
                if (otherPlayerElement) {
                    otherPlayerElement.style.opacity = 0.3;
                }
                
                player.kills++;
                player.coins += 10;
                
                // Show kill reward
                showFloatingText('+10 Coins', player.x, player.y - 30, '#FFD700');
                
                // Update HUD
                updateHUD();
                
                // Drop a collectible sometimes
                if (Math.random() < 0.3) { // 30% chance
                    const type = Math.random() < 0.7 ? 'coin' : 'health';
                    environment.spawnCollectible(type, otherPlayer.x, otherPlayer.y);
                }
                
                // Respawn after 5 seconds
                setTimeout(() => {
                    otherPlayer.health = 100;
                    otherPlayer.x = Math.random() * window.innerWidth;
                    otherPlayer.y = Math.random() * window.innerHeight;
                    
                    if (otherPlayerElement) {
                        otherPlayerElement.style.opacity = 1;
                        otherPlayerElement.style.left = otherPlayer.x + 'px';
                        otherPlayerElement.style.top = otherPlayer.y + 'px';
                    }
                }, 5000);
            }
        }
    });
}

// Create visual impact effect at hit location
function createImpactEffect(x, y) {
    const impactElement = document.createElement('div');
    impactElement.className = 'impact-effect';
    impactElement.style.left = (x + 15) + 'px';
    impactElement.style.top = (y + 25) + 'px';
    
    camera.worldContainer.appendChild(impactElement);
    
    // Remove after animation completes
    setTimeout(() => {
        camera.worldContainer.removeChild(impactElement);
    }, 500);
}

// Update HUD with player stats
function updateHUD() {
    healthDisplay.textContent = player.health;
    killsDisplay.textContent = player.kills;
    coinsDisplay.textContent = player.coins;
}