// Enemy class and related functionality
class Enemy {
    constructor(id, name) {
        this.id = id || 'enemy' + Math.floor(Math.random() * 1000);
        this.name = name || 'Enemy ' + this.id;
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.health = 100;
        this.movementTimer = 0;
        this.moveDirection = { x: 0, y: 0 };
        this.speed = 1.5;
        this.detectionRange = 200;
        
        // Create DOM element
        this.createElement();
    }
    
    createElement() {
        // Create enemy element
        this.element = document.createElement('div');
        this.element.className = 'player';
        this.element.style.backgroundImage = 'url("assets/images/enemy-character.svg")';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.id = this.id;
        camera.worldContainer.appendChild(this.element);
        
        // Create enemy stick
        this.stickElement = document.createElement('div');
        this.stickElement.className = 'stick';
        this.stickElement.style.backgroundImage = 'url("assets/images/stick-weapon.svg")';
        this.element.appendChild(this.stickElement);
        
        // Add enemy to the players list
        const playerItem = document.createElement('li');
        playerItem.textContent = this.name;
        playerItem.id = 'list-' + this.id;
        playersListElement.appendChild(playerItem);
    }
    
    update() {
        if (this.health <= 0) return;
        
        // Update movement timer
        this.movementTimer--;
        
        // Change direction randomly
        if (this.movementTimer <= 0) {
            this.movementTimer = Math.floor(Math.random() * 100) + 20; // Random timer between 20-120 frames
            this.moveDirection = {
                x: (Math.random() - 0.5) * 2, // -1 to 1
                y: (Math.random() - 0.5) * 2  // -1 to 1
            };
        }
        
        let newX = this.x;
        let newY = this.y;
        
        // Simple AI: move toward player if within detection range
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If within detection range but not too close
        if (distance < this.detectionRange && distance > 50) {
            this.moveDirection = {
                x: dx / distance, // Normalized direction
                y: dy / distance
            };
            
            // Point stick at player
            const rotation = Math.atan2(dy, dx);
            this.stickElement.style.transform = `rotate(${rotation}rad)`;
        }
        
        // Move according to current direction
        newX += this.moveDirection.x * this.speed;
        newY += this.moveDirection.y * this.speed;
        
        // Keep enemy within bounds
        newX = Math.max(0, Math.min(window.innerWidth - 30, newX));
        newY = Math.max(0, Math.min(window.innerHeight - 50, newY));
        
        // Check for obstacle collisions
        if (environment && !environment.checkObstacleCollisions(this, newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
        
        // Update position on screen
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Attack player if very close
        if (distance < 60 && Math.random() < 0.02) { // 2% chance each frame when close
            this.attackPlayer();
        }
    }
    
    attackPlayer() {
        // Set rotation for attack animation
        const attackAngle = Math.atan2(player.y - this.y, player.x - this.x);
        this.element.style.setProperty('--rotation', `${attackAngle}rad`);
        
        // Add attacking class to the stick
        this.stickElement.classList.add('attacking');
        
        setTimeout(() => {
            this.stickElement.classList.remove('attacking');
        }, 300);
        
        // Damage player
        player.health -= 10;
        
        // Create impact effect
        createImpactEffect(player.x, player.y);
        
        // Add knockback to player
        player.element.style.setProperty('--knockback-x', `${Math.cos(attackAngle) * 15}px`);
        player.element.style.setProperty('--knockback-y', `${Math.sin(attackAngle) * 15}px`);
        player.element.classList.add('knockback');
        setTimeout(() => {
            player.element.classList.remove('knockback');
        }, 300);
        
        // Show damage text
        showFloatingText('-10', player.x + 15, player.y - 10, '#FF0000');
        
        // Update HUD
        updateHUD();
        
        // Check if player is defeated
        if (player.health <= 0) {
            // Game over logic would go here
            alert('Game Over! You were defeated. Refresh to play again.');
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.element.style.opacity = 0.3;
        
        // Respawn after 5 seconds
        setTimeout(() => {
            this.respawn();
        }, 5000);
    }
    
    respawn() {
        this.health = 100;
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.element.style.opacity = 1;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
}

// Create multiple enemies
function createEnemies(count) {
    const enemies = [];
    
    for (let i = 0; i < count; i++) {
        enemies.push(new Enemy('enemy' + i, 'Player ' + i));
    }
    
    return enemies;
}

// Update all enemies
function updateEnemies() {
    otherPlayers.forEach(enemy => {
        enemy.update();
    });
}