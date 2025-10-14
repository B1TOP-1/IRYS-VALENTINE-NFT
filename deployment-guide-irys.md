# Irys NFT 合约部署指南

## 🌐 Irys 测试网信息

### 网络配置
- **网络名称**: Irys Testnet
- **RPC URL**: `https://testnet-rpc.irys.xyz/v1/execution-rpc`
- **链 ID**: `1270`
- **货币符号**: `IRYS`
- **区块浏览器**: `https://explorer.irys.xyz`

### NFT 合约信息
- **Mint 价格**: `0.01 IRYS`
- **最大供应量**: `10,000 NFT`
- **每地址最大 mint**: `10 个`

## 🚀 部署步骤

### 1. 配置 MetaMask
在 MetaMask 中添加 Irys 测试网：
1. 打开 MetaMask
2. 点击网络下拉菜单
3. 选择"添加网络"
4. 输入以上网络配置信息
5. 保存并切换到 Irys 测试网

### 2. 获取测试币
- 访问 Irys 测试网水龙头获取 IRYS 测试币
- 确保钱包中有足够的 IRYS 用于部署和交易

### 3. 在 Remix 上部署

#### 3.1 打开 Remix IDE
访问：https://remix.ethereum.org

#### 3.2 创建合约文件
1. 创建新文件 `IrysNFTSecure.sol`
2. 复制合约代码到文件中
3. 编译合约（确保使用 Solidity 0.8.20+）

#### 3.3 部署合约
1. 在 "Deploy & Run" 标签页中
2. 选择环境为 "Injected Provider - MetaMask"
3. 确保 MetaMask 连接到 Irys 测试网
4. 选择 `IrysNFTSecure` 合约
5. 输入构造函数参数：
   - `name`: "Irys Valentine NFT"
   - `symbol`: "IVNFT"
   - `initialOwner`: 您的钱包地址
6. 点击 "Deploy"

## 💰 使用合约

### Mint NFT
```javascript
// Mint 一个 NFT，支付 0.01 IRYS
await contract.mint(
    "0x接收者地址", 
    "https://你的元数据URI", 
    { value: ethers.utils.parseEther("0.01") }
);
```

### 管理函数（仅 Owner）
- `setMintPrice(newPrice)`: 设置新的 mint 价格
- `setMintActive(true/false)`: 开启/关闭 mint
- `requestWithdrawal()`: 请求提款
- `withdrawTo(address)`: 提款到指定地址

### 查询函数
- `getCurrentTokenId()`: 获取当前 token ID
- `getRemainingSupply()`: 获取剩余供应量
- `getRemainingMintForAddress(address)`: 查询地址剩余可 mint 数量
- `mintedByAddress(address)`: 查询地址已 mint 数量

## 🛡️ 安全特性

1. **两步提款模式**: 防止资金被锁定
2. **重入攻击防护**: 使用 ReentrancyGuard
3. **溢出保护**: Solidity 0.8+ 内置保护
4. **接收方验证**: 确保 mint 到有效地址
5. **精确的价格控制**: 0.01 IRYS = 10^16 wei

## 📊 合约监控

部署后，您可以通过以下方式监控合约：
- Irys 区块浏览器查看交易
- Remix 调用合约函数
- 使用 Web3.js 或 ethers.js 与合约交互

## 🎯 示例交互脚本

```javascript
// 连接到合约
const contractAddress = "0x您的合约地址";
const contract = new ethers.Contract(contractAddress, abi, signer);

// 检查 mint 价格
const mintPrice = await contract.mintPrice();
console.log("Mint Price:", ethers.utils.formatEther(mintPrice), "IRYS");

// Mint NFT
const tx = await contract.mint(
    userAddress,
    metadataURI,
    { value: mintPrice }
);
await tx.wait();
console.log("NFT Minted!");
```

现在您的合约已经配置为使用 0.01 IRYS 作为 mint 价格！🎉



