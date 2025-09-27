// P2P Nexus - Complete Web3 Integration
console.log('🚀 P2P Nexus with Web3 loading...');

class P2PNexus {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.userAddress = null;
        this.networkId = null;
        this.balance = '0';
        this.isConnected = false;
        
        this.offers = [];
        this.userReputation = 0;
        
        this.supportedNetworks = {
            1: { name: 'Ethereum Mainnet', currency: 'ETH' },
            5: { name: 'Goerli Testnet', currency: 'ETH' },
            137: { name: 'Polygon Mainnet', currency: 'MATIC' },
            80001: { name: 'Polygon Mumbai', currency: 'MATIC' },
            56: { name: 'BSC Mainnet', currency: 'BNB' },
            97: { name: 'BSC Testnet', currency: 'BNB' }
        };
        
        this.init();
    }
    
    async init() {
        console.log('Initializing P2P Nexus with Web3...');
        this.setupEventListeners();
        this.loadDemoOffers();
        
        // Check if already connected
        await this.checkExistingConnection();
        
        this.showNotification('P2P Nexus ready for Web3 trading!', 'success');
        
        // Auto-show demo
        setTimeout(() => this.showDemo(), 1500);
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
            if (e.target.classList.contains('create-offer')) {
                this.createOffer();
            }
        });
        
        // Web3 provider events
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                this.handleAccountsChanged(accounts);
            });
            
            window.ethereum.on('chainChanged', (chainId) => {
                this.handleChainChanged(chainId);
            });
        }
    }
    
    async checkExistingConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts' 
                });
                
                if (accounts.length > 0) {
                    await this.setupWeb3Provider(accounts[0]);
                    this.showNotification('Wallet automatically reconnected!', 'success');
                }
            } catch (error) {
                console.log('No existing connection found');
            }
        }
    }
    
    async connectWallet() {
        if (!window.ethereum) {
            this.showNotification('Please install MetaMask or TrustWallet!', 'error');
            this.showWalletInstallModal();
            return;
        }
        
        try {
            this.showNotification('Requesting wallet connection...', 'info');
            
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }
            
            await this.setupWeb3Provider(accounts[0]);
            this.showNotification('🎉 Wallet connected successfully!', 'success');
            
        } catch (error) {
            this.handleConnectionError(error);
        }
    }
    
    async setupWeb3Provider(userAddress) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        this.userAddress = userAddress;
        
        // Get network info
        const network = await this.provider.getNetwork();
        this.networkId = parseInt(network.chainId);
        
        // Load user data
        await this.loadUserData();
        
        // Update UI
        this.updateConnectionState(true);
    }
    
    async loadUserData() {
        try {
            // Get balance
            const balance = await this.provider.getBalance(this.userAddress);
            this.balance = ethers.utils.formatEther(balance);
            
            // Load reputation (simulated)
            this.userReputation = Math.floor(Math.random() * 100);
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    updateConnectionState(connected) {
        this.isConnected = connected;
        const connectBtn = document.querySelector('.connect-wallet');
        const walletInfo = document.getElementById('walletInfo');
        
        if (connected) {
            connectBtn.innerHTML = `✅ Connected`;
            connectBtn.style.background = 'var(--secondary-gradient)';
            
            // Create wallet info section if not exists
            if (!walletInfo) {
                this.createWalletInfoSection();
            }
            
            this.updateWalletDisplay();
            
        } else {
            connectBtn.innerHTML = `🔗 Connect Wallet`;
            connectBtn.style.background = 'var(--primary-gradient)';
            
            if (walletInfo) {
                walletInfo.remove();
            }
        }
    }
    
    createWalletInfoSection() {
        const card = document.querySelector('.card');
        const walletInfo = document.createElement('div');
        walletInfo.id = 'walletInfo';
        walletInfo.innerHTML = `
            <div class="wallet-details">
                <p><strong>Address:</strong> <span id="walletAddress">${this.userAddress}</span></p>
                <p><strong>Balance:</strong> <span id="walletBalance">${parseFloat(this.balance).toFixed(4)} ETH</span></p>
                <p><strong>Network:</strong> <span id="networkName">${this.getNetworkName(this.networkId)}</span></p>
                <p><strong>Reputation:</strong> <span id="reputationScore" class="reputation-badge">${this.userReputation}</span> ⭐</p>
            </div>
            <button class="btn create-offer" style="margin-top: 15px;">Create New Offer</button>
        `;
        
        card.appendChild(walletInfo);
        this.updateReputationBadge();
    }
    
    updateWalletDisplay() {
        if (!this.isConnected) return;
        
        const addressElement = document.getElementById('walletAddress');
        const balanceElement = document.getElementById('walletBalance');
        const networkElement = document.getElementById('networkName');
        
        if (addressElement) {
            addressElement.textContent = `${this.userAddress.substring(0, 6)}...${this.userAddress.substring(38)}`;
        }
        
        if (balanceElement) {
            const currency = this.supportedNetworks[this.networkId]?.currency || 'ETH';
            balanceElement.textContent = `${parseFloat(this.balance).toFixed(4)} ${currency}`;
        }
        
        if (networkElement) {
            networkElement.textContent = this.getNetworkName(this.networkId);
        }
        
        this.updateReputationBadge();
    }
    
    updateReputationBadge() {
        const badge = document.getElementById('reputationScore');
        if (!badge) return;
        
        badge.textContent = this.userReputation;
        
        if (this.userReputation >= 90) {
            badge.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
        } else if (this.userReputation >= 70) {
            badge.style.background = 'linear-gradient(45deg, #00b09b, #96c93d)';
        } else if (this.userReputation >= 50) {
            badge.style.background = 'linear-gradient(45deg, #2575fc, #6a11cb)';
        } else {
            badge.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
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
                reputation: 85,
                network: 5
            },
            {
                id: 2,
                token: 'USDT',
                amount: '1000', 
                price: '90000 RUB',
                method: 'Tinkoff',
                reputation: 92,
                network: 1
            },
            {
                id: 3,
                token: 'MATIC',
                amount: '500',
                price: '25000 RUB',
                method: 'Raiffeisen',
                reputation: 78,
                network: 137
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
                    <span class="network-badge">${this.getNetworkName(offer.network)}</span>
                </div>
                <button class="btn accept-btn" onclick="app.acceptOffer(${offer.id})">
                    🤝 Accept Offer
                </button>
            </div>
        `).join('');
        
        demoSection.style.display = 'block';
        demoSection.scrollIntoView({ behavior: 'smooth' });
        
        if (this.isConnected) {
            this.showNotification('Demo offers loaded! Try creating your own offer.', 'success');
        } else {
            this.showNotification('Demo offers loaded. Connect wallet to trade!', 'info');
        }
    }
    
    async createOffer() {
        if (!this.isConnected) {
            this.showNotification('Please connect your wallet first!', 'error');
            return;
        }
        
        // Simulate offer creation
        this.showNotification('Creating new offer...', 'info');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newOffer = {
            id: Date.now(),
            token: 'ETH',
            amount: '0.1',
            price: '5000 RUB',
            method: 'SberBank',
            reputation: this.userReputation,
            network: this.networkId,
            isUserOffer: true
        };
        
        this.offers.unshift(newOffer);
        this.showDemo();
        
        this.showNotification('✅ New offer created successfully!', 'success');
    }
    
    acceptOffer(offerId) {
        if (!this.isConnected) {
            this.showNotification('Please connect your wallet to accept offers!', 'error');
            return;
        }
        
        const offer = this.offers.find(o => o.id === offerId);
        if (!offer) return;
        
        if (offer.isUserOffer) {
            this.showNotification('You cannot accept your own offer!', 'warning');
            return;
        }
        
        this.showNotification(`Accepting offer: ${offer.amount} ${offer.token}...`, 'info');
        
        // Simulate trade execution
        setTimeout(() => {
            this.userReputation += 2;
            this.updateReputationBadge();
            this.showNotification(`✅ Trade completed! +2 reputation points.`, 'success');
        }, 3000);
    }
    
    getNetworkName(chainId) {
        return this.supportedNetworks[chainId]?.name || `Network ${chainId}`;
    }
    
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.disconnectWallet();
        } else if (accounts[0] !== this.userAddress) {
            this.userAddress = accounts[0];
            this.showNotification('Account changed', 'info');
            this.loadUserData();
            this.updateWalletDisplay();
        }
    }
    
    handleChainChanged(chainId) {
        const newChainId = parseInt(chainId);
        this.showNotification(`Network changed to ${this.getNetworkName(newChainId)}`, 'info');
        window.location.reload();
    }
    
    disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.userAddress = null;
        this.isConnected = false;
        
        this.updateConnectionState(false);
        this.showNotification('Wallet disconnected', 'info');
    }
    
    handleConnectionError(error) {
        switch (error.code) {
            case 4001:
                this.showNotification('Connection rejected by user', 'error');
                break;
            case -32002:
                this.showNotification('Connection request already pending', 'warning');
                break;
            default:
                this.showNotification('Connection failed: ' + error.message, 'error');
        }
    }
    
    showWalletInstallModal() {
        const modalContent = `
            <h3>Web3 Wallet Required</h3>
            <p>To use P2P Nexus, you need a Web3 wallet:</p>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <a href="https://metamask.io/download.html" target="_blank" class="btn">Install MetaMask</a>
                <a href="https://trustwallet.com/download" target="_blank" class="btn">Install TrustWallet</a>
            </div>
        `;
        this.showModal('Install Wallet', modalContent);
    }
    
    showModal(title, content) {
        // Simple modal implementation
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); display: flex; align-items: center; 
            justify-content: center; z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: #1a1a2e; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%;">
                <h3>${title}</h3>
                <div>${content}</div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-top: 20px; padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${type.toUpperCase()}</strong> ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new P2PNexus();
    console.log('✅ P2P Nexus with Web3 initialized!');
});
