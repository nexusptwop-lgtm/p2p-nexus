// P2P Nexus - Main JavaScript
console.log('🚀 P2P Nexus JavaScript loaded');

class P2PNexus {
    constructor() {
        this.offers = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDemoOffers();
        this.setupAnimations();
    }
    
    setupEventListeners() {
        // Wallet connection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('connect-wallet')) {
                this.connectWallet();
            }
        });
        
        // Demo buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('show-demo')) {
                this.showDemo();
            }
        });
    }
    
    connectWallet() {
        this.showNotification('Connecting to Web3 wallet...', 'info');
        
        // Simulate wallet connection
        setTimeout(() => {
            if (typeof window.ethereum !== 'undefined') {
                this.showNotification('Web3 wallet detected!', 'success');
            } else {
                this.showNotification('Please install MetaMask or TrustWallet', 'warning');
            }
        }, 1000);
    }
    
    loadDemoOffers() {
        this.offers = [
            {
                id: 1,
                token: 'ETH',
                amount: '0.1',
                price: '5000 RUB',
                method: 'SberBank',
                reputation: 85
            },
            {
                id: 2,
                token: 'USDT',
                amount: '1000',
                price: '90000 RUB',
                method: 'Tinkoff',
                reputation: 92
            },
            {
                id: 3,
                token: 'MATIC',
                amount: '500',
                price: '25000 RUB',
                method: 'Raiffeisen',
                reputation: 78
            }
        ];
    }
    
    showDemo() {
        const demoSection = document.getElementById('demoSection');
        const offersList = document.getElementById('offersList');
        
        if (!demoSection || !offersList) return;
        
        offersList.innerHTML = this.offers.map(offer => `
            <div class="offer-card">
                <div class="offer-header">
                    <span class="offer-amount">${offer.amount} ${offer.token}</span>
                    <span class="offer-price">${offer.price}</span>
                </div>
                <div class="offer-details">
                    <span class="payment-method">${offer.method}</span>
                    <span class="reputation">⭐ ${offer.reputation}</span>
                </div>
                <button class="btn accept-btn" onclick="app.acceptOffer(${offer.id})">
                    Accept Offer
                </button>
            </div>
        `).join('');
        
        demoSection.style.display = 'block';
        demoSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    acceptOffer(offerId) {
        const offer = this.offers.find(o => o.id === offerId);
        if (offer) {
            this.showNotification(`Accepted offer: ${offer.amount} ${offer.token} for ${offer.price}`, 'success');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${type.toUpperCase()}</strong> ${message}
            </div>
        `;
        
        // Add styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #1a1a2e;
                    padding: 15px 20px;
                    border-radius: 10px;
                    border-left: 4px solid #2575fc;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    z-index: 1000;
                    animation: slideInRight 0.3s ease;
                }
                .notification.success { border-left-color: #00b09b; }
                .notification.warning { border-left-color: #f7971e; }
                .notification.error { border-left-color: #ff6b6b; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    setupAnimations() {
        // Add CSS for offer cards
        const styles = document.createElement('style');
        styles.textContent = `
            .offer-card {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
                padding: 20px;
                margin: 15px 0;
                border: 1px solid rgba(255,255,255,0.1);
                transition: transform 0.3s ease;
            }
            .offer-card:hover {
                transform: translateY(-2px);
            }
            .offer-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-weight: bold;
            }
            .offer-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                color: #b0b0b0;
            }
            .accept-btn {
                width: 100%;
                background: var(--secondary-gradient);
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize the app
const app = new P2PNexus();
window.app = app;

// Auto-show demo after 2 seconds
setTimeout(() => app.showDemo(), 2000);
