// Pig class - a passive animal that drops bacon when killed
class Pig {
    constructor() {
        this.id = 'pig' + Math.floor(Math.random() * 10000);
        this.x = Math.random() * camera.worldWidth;
        this.y = Math.random() * camera.worldHeight;
        this.health = 30; // Weaker than enemy players
        this.movementTimer = 0;
        this.moveDirection = { x: 0, y: 0 };
        this.speed = 1; // Slower than enemies
        this.width = 40;
        this.height = 40;
        this.isAlive = true;
        
        // Create DOM element
        this.createElement();
    }
    
    createElement() {
        // Create pig element
        this.element = document.createElement('div');
        this.element.className = 'pig';
        this.element.style.backgroundImage = 'url("assets/images/pig-character.svg")';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.position = 'absolute';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.zIndex = '3';
        this.element.id = this.id;
        
        camera.worldContainer.appendChild(this.element);
    }
    
    update() {
        if (!this.isAlive) return;
        
        // Update movement timer
        this.movementTimer--;
        
        // Change direction randomly or when timer expires
        if (this.movementTimer <= 0 || Math.random() < 0.01) { // 1% chance to change direction randomly
            this.movementTimer = Math.floor(Math.random() * 100) + 20;
            
            // Random direction
            this.moveDirection = {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            };
        }
        
        // Move in current direction
        let newX = this.x + this.moveDirection.x * this.speed;
        let newY = this.y + this.moveDirection.y * this.speed;
        
        // Keep within world bounds
        newX = Math.max(0, Math.min(camera.worldWidth - this.width, newX));
        newY = Math.max(0, Math.min(camera.worldHeight - this.height, newY));
        
        // Check for obstacle collisions
        if (environment && !environment.checkObstacleCollisions(this, newX, newY)) {
            this.x = newX;
            this.y = newY;
        } else {
            // If collision, reverse direction
            this.moveDirection.x *= -1;
            this.moveDirection.y *= -1;
        }
        
        // Run away from player if too close
        const distToPlayer = Math.sqrt(
            Math.pow(player.x - this.x, 2) + 
            Math.pow(player.y - this.y, 2)
        );
        
        if (distToPlayer < 150) {
            // Run in opposite direction from player
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                this.moveDirection = {
                    x: dx / dist,
                    y: dy / dist
                };
                
                // Move faster when fleeing
                newX = this.x + this.moveDirection.x * this.speed * 2;
                newY = this.y + this.moveDirection.y * this.speed * 2;
                
                // Keep within world bounds
                newX = Math.max(0, Math.min(camera.worldWidth - this.width, newX));
                newY = Math.max(0, Math.min(camera.worldHeight - this.height, newY));
                
                // Check for obstacle collisions again
                if (environment && !environment.checkObstacleCollisions(this, newX, newY)) {
                    this.x = newX;
                    this.y = newY;
                }
            }
        }
        
        // Update position on screen
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
    
    takeDamage(amount) {
        if (!this.isAlive) return;
        
        this.health -= amount;
        
        // Visual feedback for hit
        this.element.classList.add('hit');
        setTimeout(() => {
            this.element.classList.remove('hit');
        }, 300);
        
        // Show damage text
        showFloatingText('-' + amount, this.x + 20, this.y - 10, '#FF0000');
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.isAlive = false;
        
        // Visual effect for dying
        this.element.style.opacity = 0.5;
        this.element.style.transform = 'rotate(90deg)';
        this.element.style.transition = 'all 0.5s ease';
        
        // Drop bacon item
        environment.spawnCollectible('bacon', this.x + 10, this.y + 10);
        
        // Remove after a delay
        setTimeout(() => {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 3000);
    }
}

// Create and manage pigs in the world
class PigManager {
    constructor() {
        this.pigs = [];
        this.maxPigs = 15; // Maximum number of pigs in the world
        this.spawnTimer = 0;
    }
    
    spawnPig() {
        if (this.pigs.length < this.maxPigs) {
            const pig = new Pig();
            this.pigs.push(pig);
            return pig;
        }
        return null;
    }
    
    update() {
        // Remove dead pigs from the array
        this.pigs = this.pigs.filter(pig => pig.isAlive);
        
        // Update all pigs
        this.pigs.forEach(pig => pig.update());
        
        // Spawn new pigs occasionally
        this.spawnTimer--;
        if (this.spawnTimer <= 0 && this.pigs.length < this.maxPigs) {
            this.spawnPig();
            this.spawnTimer = Math.floor(Math.random() * 300) + 100; // 3-10 seconds between spawns
        }
    }
    
    checkPlayerAttack() {
        if (!player.attacking) return;
        
        const playerRadius = 15;
        const stickRange = 70;
        
        this.pigs.forEach(pig => {
            if (!pig.isAlive) return;
            
            // Calculate distance between player and pig
            const dx = pig.x + (pig.width / 2) - player.x;
            const dy = pig.y + (pig.height / 2) - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if the stick can hit the pig based on distance and angle
            const angleDiff = Math.abs(Math.atan2(dy, dx) - player.rotation);
            if (distance < playerRadius + stickRange + (pig.width / 2) && angleDiff < 1.0) {
                // Hit!
                pig.takeDamage(20);
                
                // Create impact effect
                createImpactEffect(pig.x + (pig.width / 2), pig.y + (pig.height / 2));
                
                // Add knockback effect
                pig.x += Math.cos(player.rotation) * 10;
                pig.y += Math.sin(player.rotation) * 10;
                
                // Keep within world bounds
                pig.x = Math.max(0, Math.min(camera.worldWidth - pig.width, pig.x));
                pig.y = Math.max(0, Math.min(camera.worldHeight - pig.height, pig.y));
            }
        });
    }
}