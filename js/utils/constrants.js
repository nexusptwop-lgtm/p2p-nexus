export const IPFS_CONFIG = {
    BROWSER_NODE: {
        repo: 'ipfs-nexus-browser',
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
    },
    
    HTTP_PROVIDERS: {
        LOCAL: { url: 'http://127.0.0.1:5001' },
        INFURA: { 
            url: 'https://ipfs.infura.io:5001'
        },
        PUBLIC: { url: 'https://ipfs.io' }
    }
};

export const FILE_TYPES = {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    VIDEO: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
    AUDIO: ['mp3', 'wav', 'ogg', 'm4a'],
    DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'md'],
    CODE: ['js', 'html', 'css', 'py', 'json', 'xml']
};

export const MESSAGES = {
    SUCCESS: {
        FILE_UPLOADED: 'File successfully uploaded to IPFS',
        FILE_PINNED: 'File pinned successfully',
        CID_COPIED: 'CID copied to clipboard'
    },
    ERROR: {
        NO_NODE: 'IPFS node is not initialized',
        UPLOAD_FAILED: 'File upload failed',
        CONNECTION_FAILED: 'Failed to connect to IPFS node'
    }
};
