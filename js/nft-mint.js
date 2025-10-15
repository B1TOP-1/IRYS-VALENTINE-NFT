// NFT铸造和钱包连接功能
class NFTMinter {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.isConnected = false;
        this.isMinting = false; // 防重复点击状态
        this.isConnecting = false; // 防重复连接状态
        this.mainPageLoaded = false; // 主页面是否已加载
        this.pendingMintDisplay = false; // 是否有待显示的mint界面
        this.autoHideTimer = null; // 用于存储自动隐藏的定时器
        
        // 绑定方法
        this.connectWallet = this.connectWallet.bind(this);
        this.mintNFT = this.mintNFT.bind(this);
        this.refreshInfo = this.refreshInfo.bind(this);
        
        // 初始化
        this.init();
    }
    
    async init() {
        try {
            // 检查ethers是否加载
            if (typeof ethers === 'undefined') {
                console.error('ethers.js 未加载');
                return;
            }
            
            // 检查是否有已连接的钱包
            const walletProvider = this.detectWallet();
            if (walletProvider) {
                this.provider = new ethers.providers.Web3Provider(walletProvider);
                await this.checkConnection();
            }
            
            // 绑定事件监听器
            this.bindEvents();
            
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }
    
    bindEvents() {
        // 绑定按钮事件
        const mintBtn = document.getElementById('mint-nft-btn');
        const refreshBtn = document.getElementById('refresh-info-btn');
        const disconnectBtn = document.getElementById('disconnect-wallet-btn');
        
        if (mintBtn) {
            mintBtn.addEventListener('click', this.mintNFT);
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.refreshInfo);
        }
        
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', this.disconnect.bind(this));
        }
        
        // 监听账户变化 - 支持多钱包
        const walletProvider = this.detectWallet();
        if (walletProvider) {
            walletProvider.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.userAddress = accounts[0];
                    this.refreshInfo();
                }
            });
            
            walletProvider.on('chainChanged', () => {
                window.location.reload();
            });
        }
        
        // 同时监听OKX钱包事件
        if (window.okxwallet && window.okxwallet.ethereum) {
            window.okxwallet.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.userAddress = accounts[0];
                    this.refreshInfo();
                }
            });
            
            window.okxwallet.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }
    
    async checkConnection() {
        try {
            const walletProvider = this.detectWallet();
            if (!walletProvider) {
                return;
            }
            
            const accounts = await walletProvider.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.userAddress = accounts[0];
                this.isConnected = true;
                
                // 先设置provider和signer
                this.provider = new ethers.providers.Web3Provider(walletProvider);
                this.signer = this.provider.getSigner();
                
                // 强制检查网络
                await this.forceSwitchToIRYS();
                
                await this.setupContract();
                this.showMintSection();
                this.refreshInfo();
            }
        } catch (error) {
            console.error('检查连接失败:', error);
        }
    }
    
    async connectWallet() {
        // 防止重复连接
        if (this.isConnecting) {
            console.log('钱包连接已在进行中，请稍后重试');
            return;
        }
        
        if (this.isConnected) {
            console.log('钱包已连接');
            return;
        }
        
        this.isConnecting = true;
        
        try {
            // 检测可用的钱包
            const walletProvider = this.detectWallet();
            if (!walletProvider) {
                alert('请安装OKX钱包或MetaMask钱包');
                return;
            }
            
            // 请求连接钱包，添加错误处理
            let accounts;
            try {
                accounts = await walletProvider.request({ 
                    method: 'eth_requestAccounts' 
                });
            } catch (requestError) {
                console.error('钱包连接请求失败:', requestError);
                if (requestError.code === 4001) {
                    throw new Error(CONTRACT_CONFIG.errorMessages.userRejected);
                } else if (requestError.code === -32002) {
                    throw new Error('钱包连接请求已在进行中，请稍后重试');
                } else {
                    throw new Error('钱包连接失败: ' + requestError.message);
                }
            }
            
            if (!accounts || accounts.length === 0) {
                throw new Error(CONTRACT_CONFIG.errorMessages.userRejected);
            }
            
            this.userAddress = accounts[0];
            this.isConnected = true;
            
            // 设置provider和signer
            this.provider = new ethers.providers.Web3Provider(walletProvider);
            this.signer = this.provider.getSigner();
            
            // 强制检查并切换到IRYS网络
            await this.forceSwitchToIRYS();
            
            // 设置合约
            await this.setupContract();
            
            // 显示铸造界面
            this.showMintSection();
            
            // 刷新信息
            await this.refreshInfo();
            
            console.log('钱包连接成功:', this.userAddress);
            
        } catch (error) {
            console.error('连接钱包失败:', error);
            if (error.code === 4001) {
                alert(CONTRACT_CONFIG.errorMessages.userRejected);
            } else {
                alert('连接钱包失败: ' + error.message);
            }
        } finally {
            // 重置连接状态
            this.isConnecting = false;
        }
    }
    
    // 检测可用的钱包
    detectWallet() {
        // 优先检测OKX钱包
        if (window.okxwallet && window.okxwallet.ethereum) {
            console.log('检测到OKX钱包');
            return window.okxwallet.ethereum;
        }
        
        // 检测MetaMask钱包（避免重复日志）
        if (window.ethereum && !window.okxwallet) {
            console.log('检测到MetaMask钱包');
            return window.ethereum;
        }
        
        // 检测其他钱包
        if (window.web3 && window.web3.currentProvider) {
            console.log('检测到其他Web3钱包');
            return window.web3.currentProvider;
        }
        
        return null;
    }
    
    // 强制切换到IRYS网络
    async forceSwitchToIRYS() {
        try {
            const walletProvider = this.detectWallet();
            if (!walletProvider) {
                throw new Error('未检测到钱包');
            }
            
            const currentChainId = await walletProvider.request({ method: 'eth_chainId' });
            const targetChainId = `0x${CONTRACT_CONFIG.network.chainId.toString(16)}`;
            
            console.log('当前网络ID:', currentChainId);
            console.log('目标网络ID:', targetChainId);
            
            if (currentChainId !== targetChainId) {
                console.log('需要切换网络到IRYS Testnet');
                
                try {
                    // 尝试切换网络
                    await walletProvider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: targetChainId }],
                    });
                    console.log('网络切换成功');
                } catch (switchError) {
                    console.log('切换网络失败，尝试添加网络:', switchError);
                    
                    // 如果网络不存在，添加IRYS网络
                    if (switchError.code === 4902) {
                        await walletProvider.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: targetChainId,
                                chainName: CONTRACT_CONFIG.network.name,
                                rpcUrls: [CONTRACT_CONFIG.network.rpcUrl],
                                blockExplorerUrls: CONTRACT_CONFIG.network.blockExplorerUrls,
                                nativeCurrency: {
                                    name: 'IRYS',
                                    symbol: 'IRYS',
                                    decimals: 18
                                }
                            }],
                        });
                        console.log('IRYS网络添加成功');
                    } else {
                        throw new Error(`网络切换失败: ${switchError.message}`);
                    }
                }
            } else {
                console.log('已在正确的IRYS网络上');
            }
            
            // 验证网络切换是否成功
            const finalChainId = await walletProvider.request({ method: 'eth_chainId' });
            if (finalChainId !== targetChainId) {
                throw new Error('网络切换失败，请手动切换到IRYS Testnet');
            }
            
        } catch (error) {
            console.error('强制切换网络失败:', error);
            alert(`网络切换失败: ${error.message}\n\n请手动切换到IRYS Testnet网络\nRPC: ${CONTRACT_CONFIG.network.rpcUrl}\nChain ID: ${CONTRACT_CONFIG.network.chainId}`);
            throw error;
        }
    }
    
    async checkNetwork() {
        try {
            const network = await this.provider.getNetwork();
            if (network.chainId !== CONTRACT_CONFIG.network.chainId) {
                // 尝试切换网络
                try {
                    const walletProvider = this.detectWallet();
                    await walletProvider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${CONTRACT_CONFIG.network.chainId.toString(16)}` }],
                    });
                } catch (switchError) {
                    // 如果网络不存在，尝试添加网络
                    if (switchError.code === 4902) {
                        const walletProvider = this.detectWallet();
                        await walletProvider.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: `0x${CONTRACT_CONFIG.network.chainId.toString(16)}`,
                                chainName: CONTRACT_CONFIG.network.name,
                                rpcUrls: [CONTRACT_CONFIG.network.rpcUrl],
                                blockExplorerUrls: CONTRACT_CONFIG.network.blockExplorerUrls,
                                nativeCurrency: {
                                    name: 'IRYS',
                                    symbol: 'IRYS',
                                    decimals: 18
                                }
                            }],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }
        } catch (error) {
            console.error('网络检查失败:', error);
            alert(CONTRACT_CONFIG.errorMessages.wrongNetwork);
            throw error;
        }
    }
    
    async setupContract() {
        try {
            if (!this.signer) {
                console.warn('Signer未初始化，尝试重新初始化...');
                if (this.provider) {
                    this.signer = this.provider.getSigner();
                } else {
                    throw new Error('Provider和Signer都未初始化');
                }
            }
            
            this.contract = new ethers.Contract(
                CONTRACT_CONFIG.contractAddress,
                CONTRACT_CONFIG.abi,
                this.signer
            );
            
            console.log('合约初始化成功');
        } catch (error) {
            console.error('合约初始化失败:', error);
            throw error;
        }
    }
    
    showMintSection() {
        const mintSection = document.getElementById('nft-mint-section');
        const walletSection = document.getElementById('wallet-connected-section');
        
        if (mintSection) {
            mintSection.style.display = 'none'; // 隐藏旧的界面
        }
        
        if (walletSection) {
            walletSection.style.display = 'block'; // 显示新的美化界面
        }
        
        // 更新钱包地址显示
        this.updateWalletDisplay();
        
        // 更新按钮文本
        const connectBtns = document.querySelectorAll('.download-btn[onclick="connectWallet()"]');
        connectBtns.forEach(btn => {
            btn.textContent = '已连接';
            btn.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
        });

        // 标记有待显示的mint界面
        this.pendingMintDisplay = true;
        
        // 如果主页面已经加载，立即开始3秒倒计时
        if (this.mainPageLoaded) {
            this.startMintDisplayTimer();
        }
    }
    
    // 主页面加载完成的回调
    onMainPageLoaded() {
        this.mainPageLoaded = true;
        console.log('主页面已加载完成');
        
        // 如果有待显示的mint界面，开始3秒倒计时
        if (this.pendingMintDisplay) {
            this.startMintDisplayTimer();
        }
    }
    
    // 开始3秒倒计时显示NFT界面
    startMintDisplayTimer() {
        console.log('开始3秒倒计时显示NFT界面');
        setTimeout(() => {
            this.showNFTDisplay();
        }, 3000);
    }
    
    updateWalletDisplay() {
        // 更新钱包地址显示
        const walletAddressDisplay = document.getElementById('wallet-address-display');
        if (walletAddressDisplay && this.userAddress) {
            const shortAddress = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
            walletAddressDisplay.textContent = shortAddress;
            walletAddressDisplay.title = this.userAddress; // 鼠标悬停显示完整地址
        }
        
        // 更新网络信息
        const networkInfo = document.getElementById('network-info');
        if (networkInfo) {
            networkInfo.textContent = 'IRYS Testnet';
        }
    }
    
    async refreshInfo() {
        try {
            if (!this.contract || !this.userAddress) {
                return;
            }
            
            // 获取合约信息
            const [name, symbol, currentTokenId, maxSupply, mintPrice, maxMintPerAddress, mintActive] = await Promise.all([
                this.contract.name(),
                this.contract.symbol(),
                this.contract.getCurrentTokenId(),
                this.contract.maxSupply(),
                this.contract.mintPrice(),
                this.contract.maxMintPerAddress(),
                this.contract.mintActive()
            ]);
            
            // 获取用户信息
            const [userBalance, userMintedCount] = await Promise.all([
                this.contract.balanceOf(this.userAddress),
                this.contract.mintedByAddress(this.userAddress)
            ]);
            
            // 更新UI
            this.updateContractInfo({
                name: name,
                symbol: symbol,
                totalSupply: (currentTokenId - 1).toString(), // 当前Token ID - 1 = 已铸造数量
                maxSupply: maxSupply.toString(),
                mintPrice: ethers.utils.formatEther(mintPrice),
                maxMintPerAddress: maxMintPerAddress.toString(),
                mintActive: mintActive
            });
            
            this.updateUserInfo({
                balance: userBalance.toString(),
                mintedCount: userMintedCount.toString()
            });
            
        } catch (error) {
            console.error('刷新信息失败:', error);
        }
    }
    
    updateContractInfo(info) {
        const elements = {
            'contract-name': info.name,
            'current-token-id': info.totalSupply,
            'max-supply': info.maxSupply,
            'mint-price': info.mintPrice + ' ETH',
            'max-mint-per-address': info.maxMintPerAddress,
            'mint-active': info.mintActive ? '激活' : '未激活'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    updateUserInfo(info) {
        const elements = {
            'user-balance': info.balance,
            'user-minted-count': info.mintedCount
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    async mintNFT() {
        // 防重复点击保护
        if (this.isMinting) {
            console.log('正在铸造中，请勿重复点击');
            return;
        }
        
        try {
            if (!this.contract || !this.userAddress) {
                alert('请先连接钱包');
                return;
            }
            
            // 设置铸造状态
            this.isMinting = true;
            
            // 检查铸造是否激活
            const mintActive = await this.contract.mintActive();
            if (!mintActive) {
                alert(CONTRACT_CONFIG.errorMessages.mintNotActive);
                this.isMinting = false;
                return;
            }
            
            // 检查用户是否已达到最大铸造数量
            const userMintedCount = await this.contract.mintedByAddress(this.userAddress);
            const maxMintPerAddress = await this.contract.maxMintPerAddress();
            
            if (userMintedCount.gte(maxMintPerAddress)) {
                alert(CONTRACT_CONFIG.errorMessages.maxMintReached);
                this.isMinting = false;
                return;
            }
            
            // 获取铸造价格
            const mintPrice = await this.contract.mintPrice();
            
            // 检查余额
            const balance = await this.provider.getBalance(this.userAddress);
            if (balance.lt(mintPrice)) {
                alert(CONTRACT_CONFIG.errorMessages.insufficientFunds);
                this.isMinting = false;
                return;
            }
            
            // 显示进度
            this.showMintProgress();
            
            // 执行铸造
            const tx = await this.contract.mint(this.userAddress, CONTRACT_CONFIG.defaultTokenURI);
            
            console.log('铸造交易已发送:', tx.hash);
            
            // 等待交易确认
            const receipt = await tx.wait();
            console.log('铸造交易已确认:', receipt);
            
            // 隐藏进度
            this.hideMintProgress();
            
            // 显示美观的成功提示
            this.showSuccessModal();
            
            // 刷新信息
            await this.refreshInfo();
            
            // 3秒后自动收起mint页面回到主页面
            this.autoHideTimer = setTimeout(() => {
                this.hideNFTDisplay();
                this.hideSuccessModal();
                this.autoHideTimer = null;
            }, 3000);
            
        } catch (error) {
            console.error('铸造NFT失败:', error);
            this.hideMintProgress();
            
            if (error.code === 4001) {
                alert(CONTRACT_CONFIG.errorMessages.userRejected);
            } else {
                alert('铸造失败: ' + error.message);
            }
        } finally {
            // 重置铸造状态
            this.isMinting = false;
        }
    }
    
    showMintProgress() {
        const progress = document.getElementById('mintProgress');
        if (progress) {
            progress.style.display = 'block';
        }
        
        // 禁用所有铸造按钮
        const mintBtns = document.querySelectorAll('#mint-nft-btn, #displayMintBtn, #mintBtn');
        mintBtns.forEach(btn => {
            btn.disabled = true;
            btn.textContent = '铸造中...';
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        });
    }
    
    hideMintProgress() {
        const progress = document.getElementById('mintProgress');
        if (progress) {
            progress.style.display = 'none';
        }
        
        // 恢复所有铸造按钮
        const mintBtns = document.querySelectorAll('#mint-nft-btn, #displayMintBtn, #mintBtn');
        mintBtns.forEach(btn => {
            btn.disabled = false;
            btn.textContent = '🎯 MINT NFT NOW';
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }
    
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.isConnected = false;
        
        // 隐藏铸造界面
        const mintSection = document.getElementById('nft-mint-section');
        if (mintSection) {
            mintSection.style.display = 'none';
        }
        
        // 隐藏NFT展示区域
        this.hideNFTDisplay();
        
        // 重置按钮
        const connectBtns = document.querySelectorAll('.download-btn[onclick="connectWallet()"]');
        connectBtns.forEach(btn => {
            btn.textContent = '链接钱包';
            btn.style.background = '';
        });
    }

    showNFTDisplay() {
        const displaySection = document.getElementById('nftDisplaySection');
        if (displaySection) {
            displaySection.style.display = 'flex';
            // 添加淡入动画
            displaySection.style.opacity = '0';
            displaySection.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                displaySection.style.transition = 'all 0.3s ease-out';
                displaySection.style.opacity = '1';
                displaySection.style.transform = 'scale(1)';
            }, 10);
        }
    }

    hideNFTDisplay() {
        const displaySection = document.getElementById('nftDisplaySection');
        if (displaySection) {
            displaySection.style.transition = 'all 0.3s ease-in';
            displaySection.style.opacity = '0';
            displaySection.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                displaySection.style.display = 'none';
            }, 300);
        }
    }

    showSuccessModal() {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.style.display = 'flex';
        }
    }

    hideSuccessModal() {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.style.display = 'none';
        }
    }
}

// 全局变量
let nftMinter;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    nftMinter = new NFTMinter();
    // 设置为全局变量，以便main.js可以访问
    window.nftMinter = nftMinter;
});

// 全局函数，供HTML调用
function connectWallet() {
    if (nftMinter) {
        nftMinter.connectWallet();
    }
}

function mintNFT() {
    if (nftMinter) {
        nftMinter.mintNFT();
    }
}

function refreshInfo() {
    if (nftMinter) {
        nftMinter.refreshInfo();
    }
}

function hideNFTDisplay() {
    if (nftMinter) {
        nftMinter.hideNFTDisplay();
    }
}

function closeSuccessModal() {
    if (nftMinter) {
        // 清除自动隐藏定时器
        if (nftMinter.autoHideTimer) {
            clearTimeout(nftMinter.autoHideTimer);
            nftMinter.autoHideTimer = null;
        }
        nftMinter.hideSuccessModal();
        nftMinter.hideNFTDisplay(); // 同时隐藏NFT显示区域，返回主页面
    }
}
