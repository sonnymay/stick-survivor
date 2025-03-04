// Main game functionality

// Global game variables
let player;
let otherPlayers = [];
let storeManager;
let environment;
let camera;
let pigManager;

// DOM elements
const gameContainer = document.getElementById('game-container');
const healthDisplay = document.getElementById('health');
const killsDisplay = document.getElementById('kills');
const coinsDisplay = document.getElementById('coins');
const playersListElement = document.getElementById('players');

// Initialize the game
function initGame() {
    console.log('Initializing Stick Survivor game...');
    
    // Initialize camera first
    camera = new Camera();
    
    // Create player in the middle of the world
    player = new Player(
        camera.worldWidth / 2,
        camera.worldHeight / 2
    );
    
    // Set up player controls
    setupPlayerControls();
    
    // Create environment
    environment = new Environment();
    environment.createObstacles(50); // More obstacles for open world
    
    // Spawn initial collectibles
    for (let i = 0; i < 20; i++) {
        const type = Math.random() < 0.7 ? 'coin' : 'health';
        environment.spawnCollectible(type);
    }
    
    // Create enemies across the world
    otherPlayers = createEnemies(15); // More enemies
    
    // Initialize store
    storeManager = new StoreManager();
    
    // Initialize pig manager
    pigManager = new PigManager();
    
    // Spawn initial pigs
    for (let i = 0; i < 10; i++) {
        pigManager.spawnPig();
    }
    
    // Start the game loop
    gameLoop();
    
    console.log('Game initialized successfully!');
}

// Main game loop
function gameLoop() {
    const timestamp = Date.now();
    
    // Update player
    player.update();
    
    // Update camera
    camera.update();
    
    // Update HUD
    updateHUD();
    
    // Update environment
    environment.update(timestamp);
    
    // Update enemies
    updateEnemies();
    
    // Update pigs
    pigManager.update();
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Add basic sound effects (to be implemented with actual audio files)
const sounds = {
    hit: null,
    kill: null,
    purchase: null
};

function loadSounds() {
    // In a real implementation, load audio files
    // sounds.hit = new Audio('assets/audio/hit.mp3');
    // sounds.kill = new Audio('assets/audio/kill.mp3');
    // sounds.purchase = new Audio('assets/audio/purchase.mp3');
    
    console.log('Sound effects would be loaded here');
}

// Play a sound effect
function playSound(sound) {
    if (sounds[sound]) {
        sounds[sound].play();
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    // Ensure players stay within bounds after resize
    player.x = Math.min(player.x, window.innerWidth - 30);
    player.y = Math.min(player.y, window.innerHeight - 50);
    
    otherPlayers.forEach(enemy => {
        enemy.x = Math.min(enemy.x, window.innerWidth - 30);
        enemy.y = Math.min(enemy.y, window.innerHeight - 50);
    });
});

// Start the game when the window loads
window.addEventListener('load', () => {
    initGame();
});