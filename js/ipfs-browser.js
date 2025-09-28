import { create } from 'ipfs-core';

class IPFSBrowserNode {
    constructor() {
        this.node = null;
        this.isConnected = false;
        this.peers = 0;
    }

    async init() {
        try {
            console.log('🔄 Starting IPFS node in browser...');
            
            this.node = await create({
                repo: 'ipfs-nexus-browser-' + Math.random(),
                config: {
                    Addresses: {
                        Swarm: [
                            '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                            '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
                        ]
                    },
                    Bootstrap: [
                        "/dns4/bootstrap.libp2p.io/tcp/443/wss/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
                        "/dns4/ipfs.io/tcp/443/wss/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb"
                    ]
                }
            });

            await this.node.start();
            this.isConnected = true;
            
            console.log('✅ IPFS node started!');
            console.log('Node ID:', (await this.node.id()).id);
            
            this.setupEventListeners();
            
            return this.node;
            
        } catch (error) {
            console.error('❌ IPFS initialization error:', error);
            throw error;
        }
    }

    setupEventListeners() {
        this.node.libp2p.addEventListener('peer:connect', (evt) => {
            this.peers++;
            console.log('✅ Peer connected:', evt.detail.toString());
            this.updateUI();
        });

        this.node.libp2p.addEventListener('peer:disconnect', (evt) => {
            this.peers = Math.max(0, this.peers - 1);
            console.log('❌ Peer disconnected:', evt.detail.toString());
            this.updateUI();
        });
    }

    updateUI() {
        const statusElement = document.getElementById('connectionStatus');
        const peerCountElement = document.getElementById('statPeers');
        
        if (statusElement) {
            statusElement.textContent = this.isConnected ? 'Online' : 'Offline';
            statusElement.className = this.isConnected ? 'status-online' : 'status-offline';
        }
        
        if (peerCountElement) {
            peerCountElement.textContent = this.peers;
        }
    }

    async addFile(file) {
        if (!this.node) throw new Error('IPFS node not initialized');
        
        try {
            const fileBuffer = await file.arrayBuffer();
            const added = await this.node.add({
                path: file.name,
                content: new Uint8Array(fileBuffer)
            });
            
            console.log('📁 File added to IPFS:', added);
            return added;
            
        } catch (error) {
            console.error('❌ File upload error:', error);
            throw error;
        }
    }

    async getFile(cid) {
        if (!this.node) throw new Error('IPFS node not initialized');
        
        try {
            const chunks = [];
            for await (const chunk of this.node.cat(cid)) {
                chunks.push(chunk);
            }
            
            const fileContent = new Blob(chunks);
            return fileContent;
            
        } catch (error) {
            console.error('❌ File retrieval error:', error);
            throw error;
        }
    }

    async getNodeInfo() {
        if (!this.node) throw new Error('IPFS node not initialized');
        
        const id = await this.node.id();
        const version = await this.node.version();
        
        return {
            id: id.id,
            agentVersion: id.agentVersion,
            protocolVersion: id.protocolVersion,
            addresses: id.addresses,
            peers: this.peers,
            version: version.version
        };
    }

    async stop() {
        if (this.node) {
            await this.node.stop();
            this.isConnected = false;
            this.updateUI();
            console.log('🛑 IPFS node stopped');
        }
    }
}

export default IPFSBrowserNode;
