import { create } from 'ipfs-http-client';

class IPFSHttpClient {
    constructor(apiUrl = 'http://127.0.0.1:5001') {
        this.client = null;
        this.isConnected = false;
        this.apiUrl = apiUrl;
    }

    async connect() {
        try {
            console.log('🔄 Connecting to IPFS node via HTTP...');
            
            if (this.apiUrl.startsWith('http')) {
                this.client = create({
                    url: this.apiUrl
                });
            } else {
                this.client = create({ url: this.apiUrl });
            }

            const version = await this.client.version();
            this.isConnected = true;
            
            console.log('✅ Connected to IPFS node!');
            console.log('Version:', version.version);
            
            return this.client;
            
        } catch (error) {
            console.error('❌ Connection error:', error);
            throw error;
        }
    }

    async addFile(file) {
        if (!this.client) throw new Error('HTTP client not initialized');
        
        try {
            const fileBuffer = await file.arrayBuffer();
            const added = await this.client.add({
                path: file.name,
                content: new Uint8Array(fileBuffer)
            });
            
            console.log('📁 File added via HTTP API:', added);
            return added;
            
        } catch (error) {
            console.error('❌ File upload error:', error);
            throw error;
        }
    }

    async getFile(cid) {
        if (!this.client) throw new Error('HTTP client not initialized');
        
        try {
            const chunks = [];
            for await (const chunk of this.client.cat(cid)) {
                chunks.push(chunk);
            }
            
            const fileContent = new Blob(chunks);
            return fileContent;
            
        } catch (error) {
            console.error('❌ File retrieval error:', error);
            throw error;
        }
    }

    async pinFile(cid) {
        if (!this.client) throw new Error('HTTP client not initialized');
        
        try {
            await this.client.pin.add(cid);
            console.log('📌 File pinned:', cid);
            return true;
        } catch (error) {
            console.error('❌ Pin error:', error);
            throw error;
        }
    }

    async getNodeInfo() {
        if (!this.client) throw new Error('HTTP client not initialized');
        
        try {
            const id = await this.client.id();
            const version = await this.client.version();
            const peers = await this.client.swarm.peers();
            
            return {
                id: id.id,
                agentVersion: id.agentVersion,
                protocolVersion: id.protocolVersion,
                addresses: id.addresses,
                peers: peers.length,
                version: version.version
            };
        } catch (error) {
            console.error('❌ Info retrieval error:', error);
            throw error;
        }
    }
}

export const IPFSProviders = {
    INFURA: {
        url: 'https://ipfs.infura.io:5001'
    },
    LOCAL: {
        url: 'http://127.0.0.1:5001'
    }
};

export default IPFSHttpClient;
