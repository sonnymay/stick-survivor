// Store functionality
class StoreManager {
    constructor() {
        this.storeElement = document.getElementById('store');
        this.shopButton = document.getElementById('shop-button');
        this.closeStoreButton = document.getElementById('close-store');
        this.buyButtons = document.querySelectorAll('.buy-button');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Open store
        this.shopButton.addEventListener('click', () => {
            this.openStore();
        });
        
        // Close store
        this.closeStoreButton.addEventListener('click', () => {
            this.closeStore();
        });
        
        // Buy buttons
        this.buyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handlePurchase(e.target);
            });
        });
    }
    
    openStore() {
        this.storeElement.style.display = 'block';
    }
    
    closeStore() {
        this.storeElement.style.display = 'none';
    }
    
    handlePurchase(button) {
        const item = button.getAttribute('data-item');
        const price = parseInt(button.getAttribute('data-price'));
        
        // Simulating a purchase - in real implementation, this would connect to a payment processor
        alert(`This would connect to a payment processor for a real purchase of ${item} for $${(price/100).toFixed(2)}`);
        
        // Simulate successful purchase
        player.inventory[item] = 'premium';
        
        // Update player appearance based on purchases
        player.updateAppearance();
        
        // Close the store
        this.closeStore();
    }
    
    // Add a new item to the store (for future expansion)
    addStoreItem(name, item, price) {
        const storeItemDiv = document.createElement('div');
        storeItemDiv.className = 'store-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        
        const buyButton = document.createElement('button');
        buyButton.className = 'buy-button';
        buyButton.setAttribute('data-item', item);
        buyButton.setAttribute('data-price', price);
        buyButton.textContent = `Buy $${(price/100).toFixed(2)}`;
        
        buyButton.addEventListener('click', (e) => {
            this.handlePurchase(e.target);
        });
        
        storeItemDiv.appendChild(nameSpan);
        storeItemDiv.appendChild(buyButton);
        
        // Insert before the close button
        this.storeElement.insertBefore(storeItemDiv, this.closeStoreButton);
        
        // Update buy buttons reference
        this.buyButtons = document.querySelectorAll('.buy-button');
    }
}