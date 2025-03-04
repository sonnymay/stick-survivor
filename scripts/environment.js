// Environment class and related functionality
class Environment {
    constructor() {
        this.obstacles = [];
        this.collectibles = [];
        this.isNight = false;
        this.dayNightCycleTimer = 0;
        this.dayNightCycleDuration = 60000; // 60 seconds for a full cycle
        
        // Create background
        this.createBackground();
    }
    
    createBackground() {
        // The background is handled by the camera's world container now
        console.log("Background creation handled by camera system");
    }
    
    createObstacles(count) {
        for (let i = 0; i < count; i++) {
            this.addObstacle();
        }
    }
    
    addObstacle() {
        const obstacle = {
            id: 'obstacle' + this.obstacles.length,
            x: Math.random() * (camera.worldWidth - 60),
            y: Math.random() * (camera.worldHeight - 100),
            width: 60,
            height: 100,
            element: null
        };
        
        // Ensure obstacles aren't placed too close to the player
        const distanceToPlayer = Math.sqrt(
            Math.pow(player.x - obstacle.x, 2) + 
            Math.pow(player.y - obstacle.y, 2)
        );
        
        if (distanceToPlayer < 150) {
            // Try again with a different position
            return this.addObstacle();
        }
        
        // Create obstacle element
        const obstacleElement = document.createElement('div');
        obstacleElement.className = 'obstacle';
        obstacleElement.id = obstacle.id;
        obstacleElement.style.left = obstacle.x + 'px';
        obstacleElement.style.top = obstacle.y + 'px';
        obstacleElement.style.width = obstacle.width + 'px';
        obstacleElement.style.height = obstacle.height + 'px';
        obstacleElement.style.backgroundImage = 'url("assets/images/obstacle-tree.svg")';
        obstacleElement.style.backgroundSize = 'contain';
        obstacleElement.style.backgroundRepeat = 'no-repeat';
        obstacleElement.style.position = 'absolute';
        obstacleElement.style.zIndex = '1';
        
        camera.worldContainer.appendChild(obstacleElement);
        
        obstacle.element = obstacleElement;
        this.obstacles.push(obstacle);
        
        return obstacle;
    }
    
    spawnCollectible(type, x, y) {
        // If no position specified, use random position in the world
        x = x || Math.random() * (camera.worldWidth - 30);
        y = y || Math.random() * (camera.worldHeight - 30);
        
        // Check if the position is inside any obstacle
        const isInsideObstacle = this.checkObstacleCollisions(null, x, y);
        
        // If inside obstacle, try again with a new position
        if (isInsideObstacle) {
            return this.spawnCollectible(type);
        }
        
        const collectible = {
            id: 'collectible' + this.collectibles.length,
            type: type, // 'health', 'coin', or 'bacon'
            x: x,
            y: y,
            width: 30,
            height: 30,
            collected: false,
            element: null
        };
        
        // Create collectible element
        const collectibleElement = document.createElement('div');
        collectibleElement.className = 'collectible ' + type;
        collectibleElement.id = collectible.id;
        collectibleElement.style.left = collectible.x + 'px';
        collectibleElement.style.top = collectible.y + 'px';
        collectibleElement.style.width = collectible.width + 'px';
        collectibleElement.style.height = collectible.height + 'px';
        
        // Set the correct image based on type
        let imagePath;
        if (type === 'health') {
            imagePath = 'health-pack.svg';
        } else if (type === 'coin') {
            imagePath = 'coin.svg';
        } else if (type === 'bacon') {
            imagePath = 'bacon-item.svg';
        } else {
            imagePath = 'coin.svg'; // Default fallback
        }
        
        collectibleElement.style.backgroundImage = `url("assets/images/${imagePath}")`;
        collectibleElement.style.backgroundSize = 'contain';
        collectibleElement.style.backgroundRepeat = 'no-repeat';
        collectibleElement.style.position = 'absolute';
        collectibleElement.style.zIndex = '1';
        
        // Add animation
        collectibleElement.style.animation = 'float 2s infinite ease-in-out';
        
        camera.worldContainer.appendChild(collectibleElement);
        
        collectible.element = collectibleElement;
        this.collectibles.push(collectible);
        
        return collectible;
    }
    
    checkCollectibleCollisions() {
        this.collectibles.forEach((collectible, index) => {
            if (collectible.collected) return;
            
            // Check if player collides with collectible
            if (
                player.x < collectible.x + collectible.width &&
                player.x + 30 > collectible.x &&
                player.y < collectible.y + collectible.height &&
                player.y + 50 > collectible.y
            ) {
                // Collect the item
                collectible.collected = true;
                collectible.element.style.display = 'none';
                
                // Apply effect based on type
                if (collectible.type === 'health') {
                    player.health = Math.min(100, player.health + 20);
                    showFloatingText('+20 Health', player.x, player.y - 20, '#00FF00');
                } else if (collectible.type === 'coin') {
                    player.coins += 5;
                    showFloatingText('+5 Coins', player.x, player.y - 20, '#FFD700');
                } else if (collectible.type === 'bacon') {
                    player.health = Math.min(100, player.health + 10);
                    player.coins += 10;
                    showFloatingText('+10 Health & Coins', player.x, player.y - 20, '#FFA500');
                }
                
                // Update HUD
                updateHUD();
                
                // Remove collectible from array
                this.collectibles.splice(index, 1);
            }
        });
    }
    
    checkObstacleCollisions(entity, newX, newY) {
        for (const obstacle of this.obstacles) {
            // Simple rectangular collision detection
            if (
                newX < obstacle.x + obstacle.width &&
                newX + 30 > obstacle.x &&
                newY < obstacle.y + obstacle.height &&
                newY + 50 > obstacle.y
            ) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }
    
    updateDayNightCycle(timestamp) {
        // Check if it's time to switch between day and night
        if (timestamp - this.dayNightCycleTimer > this.dayNightCycleDuration) {
            this.isNight = !this.isNight;
            this.dayNightCycleTimer = timestamp;
            
            // Apply day/night effect
            if (this.isNight) {
                gameContainer.style.filter = 'brightness(0.6) saturate(0.8)';
                
                // Show notification
                showFloatingText('Night has fallen! Watch out for enemies!', 
                    window.innerWidth / 2 - 150, window.innerHeight / 2, '#FFFFFF', 3000);
                
                // Enemies become more aggressive at night
                otherPlayers.forEach(enemy => {
                    enemy.speed = 2.5; // Faster movement
                    enemy.detectionRange = 250; // Better detection
                });
            } else {
                gameContainer.style.filter = 'brightness(1) saturate(1)';
                
                // Show notification
                showFloatingText('Dawn breaks! The jungle stirs...', 
                    window.innerWidth / 2 - 150, window.innerHeight / 2, '#FFFFFF', 3000);
                
                // Enemies return to normal behavior
                otherPlayers.forEach(enemy => {
                    enemy.speed = 1.5;
                    enemy.detectionRange = 200;
                });
                
                // Spawn some collectibles with the new day
                this.spawnCollectible('coin');
                if (Math.random() < 0.3) { // 30% chance for health pack
                    this.spawnCollectible('health');
                }
            }
        }
    }
    
    update(timestamp) {
        // Update day/night cycle
        this.updateDayNightCycle(timestamp);
        
        // Check for collectible collisions
        this.checkCollectibleCollisions();
        
        // Randomly spawn collectibles
        if (Math.random() < 0.001) { // Small chance each frame
            const type = Math.random() < 0.7 ? 'coin' : 'health';
            this.spawnCollectible(type);
        }
    }
}

// Function to show floating text (for notifications, damage, etc.)
function showFloatingText(text, x, y, color = '#FFFFFF', duration = 1000) {
    const textElement = document.createElement('div');
    textElement.textContent = text;
    textElement.style.position = 'absolute';
    textElement.style.left = x + 'px';
    textElement.style.top = y + 'px';
    textElement.style.color = color;
    textElement.style.fontWeight = 'bold';
    textElement.style.textShadow = '1px 1px 1px rgba(0, 0, 0, 0.5)';
    textElement.style.zIndex = '10';
    textElement.style.pointerEvents = 'none'; // Don't block clicks
    
    // Animate upward and fade out
    textElement.style.animation = 'float-up 1s forwards';
    
    camera.worldContainer.appendChild(textElement);
    
    // Remove after duration
    setTimeout(() => {
        gameContainer.removeChild(textElement);
    }, duration);
}