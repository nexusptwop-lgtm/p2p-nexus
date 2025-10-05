import IPFSBrowserNode from './ipfs-browser.js';
import IPFSHttpClient from './ipfs-http.js';
import Web3Integration from './web3-integration.js';
import Helpers from './utils/helpers.js';
import { MESSAGES } from './utils/constants.js';

class P2PNexusApp {
    constructor() {
        this.ipfsNode = null;
        this.web3 = new Web3Integration();
        this.currentSection = 'exchange';
        this.files = [];
        this.tradeOffers = [];
        this.chatMessages = [];
        
        this.init();
    }

    async init() {
        try {
            // Initialize app
            await this.setupEventListeners();
            await this.loadSavedData();
            await this.startIPFSNode();
            
            console.log('🚀 P2P Nexus App initialized');
            
        } catch (error) {
            this.showNotification('Failed to initialize app: ' + error.message, 'error');
        }
    }

    async setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.getAttribute('href').substring(1));
            });
        });

        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => {
            this.connectWallet();
        });

        // Wallet modal
        document.getElementById('metamaskOption').addEventListener('click', () => {
            this.connectWallet();
        });

        document.getElementById('walletConnectOption').addEventListener('click', () => {
            this.showNotification('WalletConnect integration coming soon!', 'info');
        });

        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal('walletModal');
        });

        // Trade creation
        document.getElementById('createOffer').addEventListener('click', () => {
            this.createTradeOffer();
        });

        // File upload
        this.setupFileUpload();

        // Chat
        this.setupChat();

        // Window events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Web3 events
        window.addEventListener('web3AccountsChanged', (e) => {
            this.showNotification('Accounts updated', 'info');
        });

        window.addEventListener('web3ChainChanged', (e) => {
            this.showNotification('Network changed', 'info');
        });
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // Click to browse
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File selection
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileUpload(e.dataTransfer.files);
        });
    }

    setupChat() {
        const chatToggle = document.getElementById('chatToggle');
        const chatBody = document.getElementById('chatBody');
        const sendButton = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');

        chatToggle.addEventListener('click', () => {
            chatBody.classList.toggle('open');
        });

        sendButton.addEventListener('click', () => {
            this.sendChatMessage();
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    async startIPFSNode() {
        try {
            this.ipfsNode = new IPFSBrowserNode();
            await this.ipfsNode.init();
            
            // Update network stats
            setInterval(() => {
                this.updateNetworkStats();
            }, 5000);
            
            this.showNotification('IPFS node started successfully', 'success');
            
        } catch (error) {
            console.warn('IPFS node failed, falling back to HTTP client');
            await this.startIPFSHttpClient();
        }
    }

    async startIPFSHttpClient() {
        try {
            this.ipfsNode = new IPFSHttpClient();
            await this.ipfsNode.connect();
            this.showNotification('Connected to IPFS HTTP API', 'success');
        } catch (error) {
            this.showNotification('Failed to connect to IPFS', 'error');
        }
    }

    async connectWallet() {
        try {
            this.showNotification('Connecting wallet...', 'info');
            await this.web3.init();
            this.closeModal('walletModal');
            this.showNotification(MESSAGES.SUCCESS.WALLET_CONNECTED, 'success');
        } catch (error) {
            this.showNotification(MESSAGES.ERROR[error.message] || error.message, 'error');
        }
    }

    async handleFileUpload(files) {
        if (!files.length) return;
        
        const progressElement = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressPercent');
        
        progressElement.style.display = 'block';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
            
            try {
                const result = await this.ipfsNode.addFile(file);
                
                const fileData = {
                    id: Helpers.generateId(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    cid: result.cid.toString(),
                    timestamp: Date.now(),
                    pinned: false
                };
                
                this.files.push(fileData);
                this.saveFiles();
                this.renderFilesList();
                
                this.showNotification(`File "${file.name}" uploaded successfully`, 'success');
                
            } catch (error) {
                const message = MESSAGES.ERROR[error.message] || 'Upload failed';
                this.showNotification(`${message}: ${file.name}`, 'error');
            }
        }
        
        // Reset progress
        setTimeout(() => {
            progressElement.style.display = 'none';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
        }, 1000);
    }

    async createTradeOffer() {
        if (!this.web3.isConnected) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }

        const sendToken = document.getElementById('sendToken').value;
        const sendAmount = document.getElementById('sendAmount').value;
        const receiveToken = document.getElementById('receiveToken').value;
        const receiveAmount = document.getElementById('receiveAmount').value;

        if (!sendAmount || !receiveAmount) {
            this.showNotification('Please enter valid amounts', 'error');
            return;
        }

        try {
            const offer = {
                id: Helpers.generateId(),
                maker: this.web3.accounts[0],
                sendToken,
                sendAmount,
                receiveToken,
                receiveAmount,
                timestamp: Date.now(),
                status: 'active'
            };

            this.tradeOffers.push(offer);
            this.saveTradeOffers();
            this.renderTradeOffers();
            
            this.clearTradeForm();
            this.showNotification(MESSAGES.SUCCESS.OFFER_CREATED, 'success');
            
        } catch (error) {
            this.showNotification('Failed to create trade offer', 'error');
        }
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!this.web3.isConnected) {
            this.showNotification('Please connect your wallet to chat', 'error');
            return;
        }

        if (message.length > 1000) {
            this.showNotification('Message too long', 'error');
            return;
        }

        const chatMessage = {
            id: Helpers.generateId(),
            sender: this.web3.accounts[0],
            message: message,
            timestamp: Date.now(),
            type: 'text'
        };

        this.chatMessages.push(chatMessage);
        this.renderChatMessages();
        
        input.value = '';
        
        // Auto-scroll to bottom
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    renderFilesList() {
        const filesList = document.getElementById('filesList');
        
        if (this.files.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No files uploaded yet</p>
                </div>
            `;
            return;
        }

        filesList.innerHTML = this.files.map(file => `
            <div class="file-item">
                <div class="file-icon">
                    <i class="fas ${Helpers.getFileIcon(file.name)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-cid">${Helpers.formatAddress(file.cid, 10, 8)}</span>
                        <span class="file-size">${Helpers.formatFileSize(file.size)}</span>
                        <span class="file-date">${Helpers.formatTimestamp(file.timestamp)}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-sm btn-outline" onclick="app.downloadFile('${file.cid}', '${file.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="app.copyToClipboard('${file.cid}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="app.pinFile('${file.cid}')">
                        <i class="fas fa-thumbtack"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderTradeOffers() {
        const offersList = document.getElementById('offersList');
        
        if (this.tradeOffers.length === 0) {
            offersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <p>No active offers</p>
                </div>
            `;
            return;
        }

        offersList.innerHTML = this.tradeOffers.filter(offer => offer.status === 'active').map(offer => `
            <div class="offer-item">
                <div class="offer-header">
                    <div class="offer-amounts">
                        <span>${offer.sendAmount} ${offer.sendToken}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span>${offer.receiveAmount} ${offer.receiveToken}</span>
                    </div>
                    <div class="offer-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.acceptTradeOffer('${offer.id}')">
                            Accept
                        </button>
                    </div>
                </div>
                <div class="offer-meta">
                    <span>By: ${Helpers.formatAddress(offer.maker)}</span>
                    <span>${Helpers.formatTimestamp(offer.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    renderChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        const currentUser = this.web3.accounts[0];
        
        chatMessages.innerHTML = `
            <div class="system-message">
                Welcome to P2P Nexus Chat! Connect wallet to start trading.
            </div>
            ${this.chatMessages.map(msg => `
                <div class="message ${msg.sender === currentUser ? 'own' : 'other'}">
                    <div class="message-sender">
                        ${msg.sender === currentUser ? 'You' : Helpers.formatAddress(msg.sender)}
                    </div>
                    <div class="message-content">${msg.message}</div>
                    <div class="message-time">
                        ${Helpers.formatTimestamp(msg.timestamp)}
                    </div>
                </div>
            `).join('')}
        `;
    }

    async downloadFile(cid, filename) {
        try {
            const fileContent = await this.ipfsNode.getFile(cid);
            const url = URL.createObjectURL(fileContent);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification(`Downloading ${filename}`, 'success');
        } catch (error) {
            this.showNotification('Download failed', 'error');
        }
    }

    async pinFile(cid) {
        try {
            await this.ipfsNode.pinFile(cid);
            
            // Update file pinned status
            const file = this.files.find(f => f.cid === cid);
            if (file) {
                file.pinned = true;
                this.saveFiles();
            }
            
            this.showNotification('File pinned successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to pin file', 'error');
        }
    }

    async copyToClipboard(text) {
        try {
            await Helpers.copyToClipboard(text);
            this.showNotification('Copied to clipboard', 'success');
        } catch (error) {
            this.showNotification('Copy failed', 'error');
        }
    }

    async acceptTradeOffer(offerId) {
        if (!this.web3.isConnected) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }

        const offer = this.tradeOffers.find(o => o.id === offerId);
        if (!offer) return;

        try {
            // In a real implementation, this would involve smart contract calls
            this.showNotification('Processing trade...', 'info');
            
            // Simulate trade processing
            await Helpers.sleep(2000);
            
            offer.status = 'completed';
            this.saveTradeOffers();
            this.renderTradeOffers();
            
            this.showNotification(MESSAGES.SUCCESS.TRADE_COMPLETED, 'success');
            
        } catch (error) {
            this.showNotification('Trade failed', 'error');
        }
    }

    updateNetworkStats() {
        // Update active trades count
        const activeTrades = document.getElementById('activeTrades');
        if (activeTrades) {
            activeTrades.textContent = this.tradeOffers.filter(o => o.status === 'active').length;
        }

        // Update network peers
        const networkPeers = document.getElementById('networkPeers');
        if (networkPeers && this.ipfsNode) {
            networkPeers.textContent = this.ipfsNode.peers || 0;
        }
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const id = Helpers.generateId();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = `notification-${id}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: inherit; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notifications.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            const element = document.getElementById(`notification-${id}`);
            if (element) {
                element.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    clearTradeForm() {
        document.getElementById('sendAmount').value = '';
        document.getElementById('receiveAmount').value = '';
    }

    async loadSavedData() {
        // Load files from localStorage
        this.files = Helpers.getStorage('p2p-nexus-files') || [];
        this.tradeOffers = Helpers.getStorage('p2p-nexus-offers') || [];
        this.chatMessages = Helpers.getStorage('p2p-nexus-chat') || [];
        
        this.renderFilesList();
        this.renderTradeOffers();
        this.renderChatMessages();
    }

    saveFiles() {
        Helpers.setStorage('p2p-nexus-files', this.files);
    }

    saveTradeOffers() {
        Helpers.setStorage('p2p-nexus-offers', this.tradeOffers);
    }

    saveChatMessages() {
        // Only keep last 100 messages
        if (this.chatMessages.length > 100) {
            this.chatMessages = this.chatMessages.slice(-100);
        }
        Helpers.setStorage('p2p-nexus-chat', this.chatMessages);
    }

    // Public methods for HTML onclick handlers
    async downloadFile(cid, filename) {
        await this.downloadFile(cid, filename);
    }

    async copyToClipboard(text) {
        await this.copyToClipboard(text);
    }

    async pinFile(cid) {
        await this.pinFile(cid);
    }

    async acceptTradeOffer(offerId) {
        await this.acceptTradeOffer(offerId);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new P2PNexusApp();
});

export default P2PNexusApp;
