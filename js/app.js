import IPFSBrowserNode from './ipfs-browser.js';
import IPFSHttpClient, { IPFSProviders } from './ipfs-http.js';
import FileManager from './components/file-manager.js';
import Helpers from './utils/helpers.js';
import { MESSAGES } from './utils/constants.js';

class IPFSApp {
    constructor() {
        this.browserNode = null;
        this.httpClient = null;
        this.fileManager = new FileManager();
        this.currentMode = 'browser';
        this.currentProvider = IPFSProviders.LOCAL;
        
        this.init();
    }

    async init() {
        try {
            // Load saved files
            this.fileManager.loadFromLocalStorage();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start with browser node
            await this.startBrowserNode();
            
            console.log('🚀 Nexus IPFS App initialized');
            
        } catch (error) {
            this.showNotification('Failed to initialize app: ' + error.message, 'error');
        }
    }

    setupEventListeners() {
        // Mode switching
        document.getElementById('switchToBrowser').addEventListener('click', () => {
            this.switchToBrowserMode();
        });
        
        document.getElementById('switchToHttp').addEventListener('click', () => {
            this.switchToHttpMode();
        });

        // File upload
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
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

        // File search
        const searchInput = document.getElementById('fileSearch');
        const debouncedSearch = Helpers.debounce((query) => {
            this.fileManager.searchFiles(query);
        }, 300);
        
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        // Refresh files
        document.getElementById('refreshFiles').addEventListener('click', () => {
            this.fileManager.renderFilesList();
        });

        // Quick actions
        document.getElementById('pinSelected').addEventListener('click', () => {
            if (this.fileManager.selectedFile) {
                this.togglePinFile(this.fileManager.selectedFile.id);
            }
        });

        document.getElementById('shareSelected').addEventListener('click', () => {
            if (this.fileManager.selectedFile) {
                this.copyCID(this.fileManager.selectedFile.cid);
            }
        });

        document.getElementById('downloadSelected').addEventListener('click', () => {
            if (this.fileManager.selectedFile) {
                this.downloadFile(
                    this.fileManager.selectedFile.cid, 
                    this.fileManager.selectedFile.name
                );
            }
        });

        // Modal
        const modal = document.getElementById('advancedModal');
        const closeModal = document.querySelector('.close-modal');
        
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async startBrowserNode() {
        try {
            this.browserNode = new IPFSBrowserNode();
            await this.browserNode.init();
            
            this.updateConnectionInfo();
            this.showNotification('Browser IPFS node started successfully', 'success');
            
        } catch (error) {
            this.showNotification('Failed to start browser node: ' + error.message, 'error');
        }
    }

    async connectToHttpNode(provider = IPFSProviders.LOCAL) {
        try {
            this.httpClient = new IPFSHttpClient(provider.url);
            await this.httpClient.connect();
            
            this.currentProvider = provider;
            this.updateConnectionInfo();
            this.showNotification('Connected to IPFS node via HTTP', 'success');
            
        } catch (error) {
            this.showNotification('Failed to connect to HTTP node: ' + error.message, 'error');
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
                let result;
                if (this.currentMode === 'browser' && this.browserNode) {
                    result = await this.browserNode.addFile(file);
                } else if (this.currentMode === 'http' && this.httpClient) {
                    result = await this.httpClient.addFile(file);
                } else {
                    throw new Error('No IPFS node initialized');
                }
                
                const fileData = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    cid: result.cid
                };
                
                const savedFile = this.fileManager.addFile(fileData);
                this.fileManager.selectFile(savedFile.id);
                
                this.showNotification(`File "${file.name}" uploaded successfully`, 'success');
                
            } catch (error) {
                this.showNotification(`Failed to upload "${file.name}": ${error.message}`, 'error');
            }
        }
        
        // Reset progress
        setTimeout(() => {
            progressElement.style.display = 'none';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
        }, 1000);
    }

    async downloadFile(cid, filename) {
        try {
            let fileContent;
            if (this.currentMode === 'browser' && this.browserNode) {
                fileContent = await this.browserNode.getFile(cid);
            } else if (this.currentMode === 'http' && this.httpClient) {
                fileContent = await this.httpClient.getFile(cid);
            } else {
                throw new Error('No IPFS node initialized');
            }
            
            const url = URL.createObjectURL(fileContent);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification(`File "${filename}" downloaded`, 'success');
            
        } catch (error) {
            this.showNotification(`Download failed: ${error.message}`, 'error');
        }
    }

    async copyCID(cid) {
        try {
            await Helpers.copyToClipboard(cid);
            this.showNotification('CID copied to clipboard', 'success');
        } catch (error) {
            this.showNotification('Failed to copy CID', 'error');
        }
    }

    async togglePinFile(fileId) {
        try {
            const file = this.fileManager.files.find(f => f.id === fileId);
            if (!file) return;

            if (this.currentMode === 'http' && this.httpClient) {
                if (!file.pinned) {
                    await this.httpClient.pinFile(file.cid);
                }
                // Note: Unpinning might not be available in all HTTP clients
            }
            
            this.fileManager.pinFile(fileId);
            this.showNotification(
                `File ${file.pinned ? 'pinned' : 'unpinned'} successfully`, 
                'success'
            );
            
        } catch (error) {
            this.showNotification(`Pin operation failed: ${error.message}`, 'error');
        }
    }

    viewOnGateway(cid) {
        const url = Helpers.getIPFSGatewayUrl(cid);
        window.open(url, '_blank');
    }

    updateConnectionInfo() {
        setTimeout(async () => {
            try {
                let info;
                if (this.currentMode === 'browser' && this.browserNode) {
                    info = await this.browserNode.getNodeInfo();
                } else if (this.currentMode === 'http' && this.httpClient) {
                    info = await this.httpClient.getNodeInfo();
                }
                
                if (info) {
                    const nodeIdShort = document.getElementById('nodeIdShort');
                    const peerCount = document.getElementById('peerCount');
                    const statPeers = document.getElementById('statPeers');
                    
                    if (nodeIdShort) {
                        nodeIdShort.textContent = `Node: ${info.id.substring(0, 12)}...`;
                    }
                    if (peerCount) {
                        peerCount.textContent = `Peers: ${info.peers}`;
                    }
                    if (statPeers) {
                        statPeers.textContent = info.peers;
                    }
                }
            } catch (error) {
                console.error('Error updating connection info:', error);
            }
        }, 1000);
    }

    switchToBrowserMode() {
        this.currentMode = 'browser';
        document.getElementById('switchToBrowser').classList.add('active');
        document.getElementById('switchToHttp').classList.remove('active');
        this.showNotification('Switched to Browser Node mode', 'info');
        this.updateConnectionInfo();
    }

    switchToHttpMode() {
        this.currentMode = 'http';
        document.getElementById('switchToHttp').classList.add('active');
        document.getElementById('switchToBrowser').classList.remove('active');
        this.connectToHttpNode();
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

    // Public methods for HTML onclick handlers
    async downloadFile(cid, filename) {
        await this.downloadFile(cid, filename);
    }

    async copyCID(cid) {
        await this.copyCID(cid);
    }

    async togglePinFile(fileId) {
        await this.togglePinFile(fileId);
    }

    viewOnGateway(cid) {
        this.viewOnGateway(cid);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new IPFSApp();
});

export default IPFSApp;
