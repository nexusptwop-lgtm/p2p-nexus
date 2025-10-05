// IPFS Configuration
export const IPFS_CONFIG = {
    BROWSER_NODE: {
        repo: 'p2p-nexus-browser',
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

// Blockchain Networks
export const BLOCKCHAIN_NETWORKS = {
    1: {
        name: 'Ethereum Mainnet',
        chainId: '0x1',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        explorer: 'https://etherscan.io'
    },
    5: {
        name: 'Goerli Testnet',
        chainId: '0x5',
        rpcUrl: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
        explorer: 'https://goerli.etherscan.io'
    },
    137: {
        name: 'Polygon Mainnet',
        chainId: '0x89',
        rpcUrl: 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com'
    }
};

// Token Configuration
export const SUPPORTED_TOKENS = {
    ETH: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000'
    },
    DAI: {
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    },
    USDC: {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    }
};

// App Constants
export const APP_CONSTANTS = {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    SUPPORTED_FILE_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'audio/mpeg',
        'application/pdf',
        'text/plain',
        'application/json'
    ],
    CHAT_MAX_MESSAGE_LENGTH: 1000,
    TRADE_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
};

// Messages
export const MESSAGES = {
    SUCCESS: {
        WALLET_CONNECTED: 'Wallet connected successfully',
        FILE_UPLOADED: 'File uploaded to IPFS successfully',
        OFFER_CREATED: 'Trade offer created successfully',
        TRADE_COMPLETED: 'Trade completed successfully'
    },
    ERROR: {
        NO_WALLET: 'No Web3 wallet detected',
        WRONG_NETWORK: 'Please connect to a supported network',
        TRANSACTION_FAILED: 'Transaction failed',
        FILE_TOO_LARGE: 'File size exceeds maximum limit',
        INVALID_FILE_TYPE: 'File type not supported'
    },
    INFO: {
        CONNECTING: 'Connecting to wallet...',
        PROCESSING: 'Processing transaction...',
        UPLOADING: 'Uploading file to IPFS...'
    }
};
