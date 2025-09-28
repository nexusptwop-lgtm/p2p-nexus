import Helpers from '../utils/helpers.js';

export class FileManager {
    constructor() {
        this.files = [];
        this.selectedFile = null;
    }

    addFile(fileData) {
        const file = {
            id: Helpers.generateId(),
            name: fileData.name,
            size: fileData.size,
            type: fileData.type,
            cid: fileData.cid.toString(),
            timestamp: new Date().toISOString(),
            pinned: false
        };
        
        this.files.push(file);
        this.saveToLocalStorage();
        this.renderFilesList();
        
        return file;
    }

    removeFile(fileId) {
        this.files = this.files.filter(file => file.id !== fileId);
        this.saveToLocalStorage();
        this.renderFilesList();
    }

    pinFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (file) {
            file.pinned = !file.pinned;
            this.saveToLocalStorage();
            this.renderFilesList();
        }
    }

    selectFile(fileId) {
        this.selectedFile = this.files.find(f => f.id === fileId) || null;
        this.renderFileDetails();
        this.updateActionButtons();
    }

    getFileByCid(cid) {
        return this.files.find(file => file.cid === cid);
    }

    searchFiles(query) {
        if (!query) {
            this.renderFilesList();
            return;
        }

        const filteredFiles = this.files.filter(file => 
            file.name.toLowerCase().includes(query.toLowerCase()) ||
            file.cid.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilesList(filteredFiles);
    }

    renderFilesList(filesToRender = null) {
        const filesList = document.getElementById('filesList');
        const files = filesToRender || this.files;

        if (files.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No files uploaded yet</h3>
                    <p>Upload your first file to get started with IPFS</p>
                </div>
            `;
            return;
        }

        filesList.innerHTML = files.map(file => `
            <div class="file-item ${this.selectedFile?.id === file.id ? 'selected' : ''}" 
                 data-file-id="${file.id}">
                <div class="file-icon">
                    <i class="fas ${Helpers.getFileIcon(file.name)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-cid">${file.cid}</span>
                        <span class="file-size">${Helpers.formatFileSize(file.size)}</span>
                        <span class="file-date">${new Date(file.timestamp).toLocaleDateString()}</span>
                        ${file.pinned ? '<span class="file-pinned"><i class="fas fa-thumbtack"></i> Pinned</span>' : ''}
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-action" onclick="app.downloadFile('${file.cid}', '${file.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-action" onclick="app.copyCID('${file.cid}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-action ${file.pinned ? 'active' : ''}" 
                            onclick="app.togglePinFile('${file.id}')">
                        <i class="fas fa-thumbtack"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add click event listeners
        filesList.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.file-actions')) {
                    const fileId = item.dataset.fileId;
                    this.selectFile(fileId);
                }
            });
        });

        // Update stats
        this.updateStats();
    }

    renderFileDetails() {
        const fileDetails = document.getElementById('fileDetails');
        
        if (!this.selectedFile) {
            fileDetails.innerHTML = `
                <div class="details-placeholder">
                    <i class="fas fa-file-alt"></i>
                    <p>Select a file to view details</p>
                </div>
            `;
            return;
        }

        const file = this.selectedFile;
        fileDetails.innerHTML = `
            <div class="file-detail-item">
                <div class="file-detail-label">File Name</div>
                <div class="file-detail-value">${file.name}</div>
            </div>
            <div class="file-detail-item">
                <div class="file-detail-label">CID</div>
                <div class="file-detail-value">${file.cid}</div>
            </div>
            <div class="file-detail-item">
                <div class="file-detail-label">Size</div>
                <div class="file-detail-value">${Helpers.formatFileSize(file.size)}</div>
            </div>
            <div class="file-detail-item">
                <div class="file-detail-label">Type</div>
                <div class="file-detail-value">${file.type || 'Unknown'}</div>
            </div>
            <div class="file-detail-item">
                <div class="file-detail-label">Uploaded</div>
                <div class="file-detail-value">${new Date(file.timestamp).toLocaleString()}</div>
            </div>
            <div class="file-detail-item">
                <div class="file-detail-label">Status</div>
                <div class="file-detail-value">
                    ${file.pinned ? '<i class="fas fa-thumbtack"></i> Pinned' : 'Not Pinned'}
                </div>
            </div>
            <div class="detail-actions">
                <button class="btn btn-primary" onclick="app.downloadFile('${file.cid}', '${file.name}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-outline" onclick="app.copyCID('${file.cid}')">
                    <i class="fas fa-copy"></i> Copy CID
                </button>
                <button class="btn btn-outline" onclick="app.viewOnGateway('${file.cid}')">
                    <i class="fas fa-external-link-alt"></i> View on Gateway
                </button>
            </div>
        `;
    }

    updateActionButtons() {
        const pinBtn = document.getElementById('pinSelected');
        const shareBtn = document.getElementById('shareSelected');
        const downloadBtn = document.getElementById('downloadSelected');

        const hasSelection = this.selectedFile !== null;

        pinBtn.disabled = !hasSelection;
        shareBtn.disabled = !hasSelection;
        downloadBtn.disabled = !hasSelection;

        if (hasSelection) {
            pinBtn.innerHTML = this.selectedFile.pinned ? 
                '<i class="fas fa-thumbtack-slash"></i> Unpin File' : 
                '<i class="fas fa-thumbtack"></i> Pin File';
        }
    }

    updateStats() {
        const totalFiles = document.getElementById('statTotalFiles');
        if (totalFiles) {
            totalFiles.textContent = this.files.length;
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('nexus-ipfs-files', JSON.stringify(this.files));
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('nexus-ipfs-files');
            if (saved) {
                this.files = JSON.parse(saved);
                this.renderFilesList();
            }
        } catch (error) {
            console.error('Error loading files from localStorage:', error);
        }
    }

    clearAllFiles() {
        this.files = [];
        this.selectedFile = null;
        this.saveToLocalStorage();
        this.renderFilesList();
        this.renderFileDetails();
        this.updateActionButtons();
    }
}

export default FileManager;
