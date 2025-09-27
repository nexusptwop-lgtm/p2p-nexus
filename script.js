// P2P Nexus - Main JavaScript
console.log('🚀 P2P Nexus JavaScript loaded');

class P2PNexus {
    constructor() {
        this.offers = [];
        this.isConnected = false;
        this.userAddress = null;
        this.init();
    }
    
    init() {
        console.log('Initializing P2P Nexus...');
        this.setupEventListeners();
        this.loadDemoOffers();
        this.showNotification('P2P Nexus loaded successfully!', 'success');
        
        // Auto-show demo after 2 seconds
        setTimeout(() => this.showDemo(), 2000);
    }
    
    setupEventListeners() {
        // Wallet connection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('connect-wallet')) {
                this.connectWallet();
            }
            if (e.target.classList.contains('show-demo')) {
                this.showDemo();
            }
        });
    }
    
    async connectWallet() {
        this.showNotification('Connecting to Web3 wallet...', 'info');
        
        // Check if Web3 wallet is available
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                this.userAddress = accounts[0];
                this.isConnected = true;
                
                this.showNotification('🎉 Wallet connected successfully!', 'success');
                this.updateUI();
                
            } catch (error) {
                this.showNotification('❌ Wallet connection failed', 'error');
                console.error('Wallet error:', error);
            }
        } else {
            this.showNotification('⚠️ Please install MetaMask or TrustWallet', 'warning');
        }
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
        
        if (!demoSection || !offersList) {
            console.error('Demo elements not found');
            return;
        }
        
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
                    🤝 Accept Offer
                </button>
            </div>
        `).join('');
        
        demoSection.style.display = 'block';
        demoSection.scrollIntoView({ behavior: 'smooth' });
        
        this.showNotification('Demo offers loaded!', 'success');
    }
    
    acceptOffer(offerId) {
        const offer = this.offers.find(o => o.id === offerId);
        if (offer) {
            this.showNotification(`✅ Accepted: ${offer.amount} ${offer.token} for ${offer.price}`, 'success');
        }
    }
    
    updateUI() {
        // Update UI when wallet is connected
        const connectBtn = document.querySelector('.connect-wallet');
        if (connectBtn && this.isConnected) {
            connectBtn.textContent = `Connected: ${this.userAddress.substring(0, 6)}...`;
            connectBtn.style.background = 'var(--secondary-gradient)';
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${type.toUpperCase()}</strong> ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new P2PNexus();
    console.log('✅ P2P Nexus initialized successfully');
});

// Global function for HTML buttons
function connectWallet() {
    if (window.app) window.app.connectWallet();
}

function showDemo() {
    if (window.app) window.app.showDemo();
}
// P2P Nexus - Web3 Integration
class P2PNexus {
    constructor() {
        this.isConnected = false;
        this.currentAccount = null;
        this.currentChainId = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkWalletConnection();
    }

    bindEvents() {
        // Кнопка подключения кошелька
        document.getElementById('connectWallet').addEventListener('click', () => {
            this.connectWallet();
        });

        // Кнопка демо-офферов
        document.getElementById('showDemo').addEventListener('click', () => {
            this.showDemoOffers();
        });

        // Слушаем события кошелька
        if (typeof window.ethereum !== 'undefined') {
            // Смена аккаунта
            window.ethereum.on('accountsChanged', (accounts) => {
                this.handleAccountsChanged(accounts);
            });

            // Смена сети
            window.ethereum.on('chainChanged', (chainId) => {
                this.handleChainChanged(chainId);
            });
        }
    }

    async connectWallet() {
        try {
            // Проверяем наличие MetaMask/TrustWallet
            if (typeof window.ethereum === 'undefined') {
                alert('Please install MetaMask or TrustWallet to use this dApp!');
                return;
            }

            // Запрашиваем подключение
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length > 0) {
                this.currentAccount = accounts[0];
                this.isConnected = true;
                this.updateUI();
                
                // Получаем информацию о сети
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                this.handleChainChanged(chainId);
                
                console.log('Wallet connected:', this.currentAccount);
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            if (error.code === 4001) {
                alert('Please connect your wallet to continue.');
            } else {
                alert('Error connecting wallet: ' + error.message);
            }
        }
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.currentAccount = accounts[0];
                    this.isConnected = true;
                    
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    this.handleChainChanged(chainId);
                    
                    this.updateUI();
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    }

    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // Пользователь отключил кошелек
            this.isConnected = false;
            this.currentAccount = null;
            alert('Wallet disconnected');
        } else if (accounts[0] !== this.currentAccount) {
            // Сменился аккаунт
            this.currentAccount = accounts[0];
        }
        this.updateUI();
    }

    handleChainChanged(chainId) {
        this.currentChainId = chainId;
        this.updateNetworkInfo(chainId);
    }

    updateUI() {
        const walletInfo = document.getElementById('walletInfo');
        const connectBtn = document.getElementById('connectWallet');
        const networkInfo = document.getElementById('networkInfo');

        if (this.isConnected && this.currentAccount) {
            // Форматируем адрес для отображения
            const shortAddress = this.currentAccount.substring(0, 6) + '...' + this.currentAccount.substring(38);
            walletInfo.textContent = `Connected: ${shortAddress}`;
            walletInfo.style.color = '#4CAF50';
            
            connectBtn.textContent = 'Disconnect Wallet';
            connectBtn.onclick = () => this.disconnectWallet();
            
            networkInfo.style.display = 'block';
        } else {
            walletInfo.textContent = 'Not connected';
            walletInfo.style.color = '#ff4444';
            
            connectBtn.textContent = 'Connect Wallet';
            connectBtn.onclick = () => this.connectWallet();
            
            networkInfo.style.display = 'none';
        }
    }

    updateNetworkInfo(chainId) {
        const networkName = document.getElementById('networkName');
        const chainIdElement = document.getElementById('chainId');

        chainIdElement.textContent = chainId;

        // Определяем название сети по chainId
        const networks = {
            '0x1': 'Ethereum Mainnet',
            '0xaa36a7': 'Sepolia Testnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Polygon Mumbai',
            '0x38': 'BSC Mainnet',
            '0x61': 'BSC Testnet'
        };

        networkName.textContent = networks[chainId] || 'Unknown Network';
        networkName.style.color = networks[chainId] ? '#4CAF50' : '#ff9800';
    }

    disconnectWallet() {
        this.isConnected = false;
        this.currentAccount = null;
        this.currentChainId = null;
        this.updateUI();
        alert('Wallet disconnected');
    }

    showDemoOffers() {
        const offersList = document.getElementById('offersList');
        
        if (!this.isConnected) {
            offersList.innerHTML = `
                <div class="warning">
                    <p>🔗 Please connect your wallet first to view offers</p>
                </div>
            `;
            return;
        }

        // Демо-офферы
        offersList.innerHTML = `
            <div class="offer-card">
                <h3>ETH to USDT</h3>
                <p><strong>Rate:</strong> 1 ETH = 2500 USDT</p>
                <p><strong>Limit:</strong> 0.1 - 5 ETH</p>
                <p><strong>Payment:</strong> Bank Transfer</p>
                <button class="btn trade-btn">Start Trade</button>
            </div>
            <div class="offer-card">
                <h3>USDT to ETH</h3>
                <p><strong>Rate:</strong> 1 USDT = 0.0004 ETH</p>
                <p><strong>Limit:</strong> 100 - 5000 USDT</p>
                <p><strong>Payment:</strong> Wise/Revolut</p>
                <button class="btn trade-btn">Start Trade</button>
            </div>
        `;

        // Добавляем обработчики для кнопок торговли
        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Trade functionality will be implemented soon!');
            });
        });
    }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    window.p2pNexus = new P2PNexus();
});

// Обработчик ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});
