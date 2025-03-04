// Camera system for open-world scrolling
class Camera {
    constructor() {
        // Actual world size (much larger than screen)
        this.worldWidth = 3000;
        this.worldHeight = 3000;
        
        // Camera position (centered on player)
        this.x = 0;
        this.y = 0;
        
        // Create world container
        this.createWorldContainer();
    }
    
    createWorldContainer() {
        // Create a large world container
        this.worldContainer = document.createElement('div');
        this.worldContainer.id = 'world-container';
        this.worldContainer.style.position = 'absolute';
        this.worldContainer.style.width = this.worldWidth + 'px';
        this.worldContainer.style.height = this.worldHeight + 'px';
        this.worldContainer.style.backgroundImage = 'url("assets/images/jungle-background.svg")';
        this.worldContainer.style.backgroundSize = '1000px 1000px';
        this.worldContainer.style.backgroundRepeat = 'repeat';
        
        // Add world container to game container
        gameContainer.appendChild(this.worldContainer);
    }
    
    followPlayer() {
        // Calculate camera position (centered on player)
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Target position (centered on player)
        const targetX = player.x - screenWidth / 2;
        const targetY = player.y - screenHeight / 2;
        
        // Update camera position with some smoothing
        this.x = Math.max(0, Math.min(this.worldWidth - screenWidth, targetX));
        this.y = Math.max(0, Math.min(this.worldHeight - screenHeight, targetY));
        
        // Apply camera position to world container
        this.worldContainer.style.transform = `translate(${-this.x}px, ${-this.y}px)`;
    }
    
    worldToScreen(worldX, worldY) {
        // Convert world coordinates to screen coordinates
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
    
    screenToWorld(screenX, screenY) {
        // Convert screen coordinates to world coordinates
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
    
    update() {
        this.followPlayer();
    }
}