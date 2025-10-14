// 合约配置信息
const CONTRACT_CONFIG = {
    // 合约地址 - IRYS测试网部署的合约地址
    contractAddress: "0xEC1bBDe70c5954779226C963C93FcC0D7989a0E3",
    
    // 网络配置 - IRYS测试网
    network: {
        chainId: 1270, // IRYS Testnet
        name: "IRYS Testnet",
        rpcUrl: "https://testnet-rpc.irys.xyz/v1/execution-rpc",
        blockExplorerUrls: ["https://explorer.irys.xyz"]
    },
    
    // ABI - 简化的NFT合约ABI
    abi: [
        {
            "inputs": [],
            "name": "name",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "maxSupply",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "mintPrice",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "maxMintPerAddress",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "mintActive",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
            "name": "mintedByAddress",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "string", "name": "uri", "type": "string"}],
            "name": "mint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCurrentTokenId",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getRemainingSupply",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
            "name": "tokenURI",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
            "name": "ownerOf",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    
    // 默认Token URI
    defaultTokenURI: "https://gateway.pinata.cloud/ipfs/QmValentineNFT", // Valentine NFT 默认元数据
    
    // 错误消息
    errorMessages: {
        noWallet: "请安装OKX钱包或MetaMask钱包",
        wrongNetwork: "请切换到正确的网络",
        userRejected: "用户取消了连接",
        contractError: "合约调用失败",
        insufficientFunds: "余额不足",
        mintNotActive: "铸造功能未激活",
        maxMintReached: "已达到最大铸造数量"
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONTRACT_CONFIG;
}
