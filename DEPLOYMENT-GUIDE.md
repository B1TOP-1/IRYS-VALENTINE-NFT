# 🚀 Valentine NFT 合约部署指南

## 📋 部署到 IRYS Testnet

### 🌐 网络信息
- **网络名称**: IRYS Testnet
- **RPC URL**: https://testnet-rpc.irys.xyz/v1/execution-rpc
- **Chain ID**: 1270
- **货币符号**: IRYS
- **区块浏览器**: https://explorer.irys.xyz

## 🔧 准备工作

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `env.example` 为 `.env` 并填写以下信息：

```bash
cp env.example .env
```

编辑 `.env` 文件：
```env
# IRYS Testnet 部署配置
PRIVATE_KEY=your_private_key_here
IRYS_TOKEN_ADDRESS=0xYourIRYSTokenAddress
OWNER_ADDRESS=your_wallet_address

# Pinata IPFS 配置
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# 合约配置
NFT_NAME=Valentine Collection
NFT_SYMBOL=VALENTINE
MINT_PRICE=10000000000000000
```

### 3. 获取 IRYS 测试代币
1. 访问 IRYS 测试网水龙头
2. 获取测试 IRYS 代币用于支付 gas 费用
3. 获取 IRYS ERC20 代币合约地址

## 🚀 部署步骤

### 1. 编译合约
```bash
npm run compile
```

### 2. 部署到 IRYS Testnet
```bash
npm run deploy
```

### 3. 验证部署
部署完成后会生成 `deployment-info.json` 文件，包含：
- 合约地址
- 部署者信息
- 交易哈希
- 区块号

## 📊 部署后验证

### 检查合约状态
```bash
# 查看合约信息
npx hardhat console --network irysTestnet
```

在控制台中执行：
```javascript
const contract = await ethers.getContractAt("IrysNFTSecure", "YOUR_CONTRACT_ADDRESS");
console.log("合约名称:", await contract.name());
console.log("合约符号:", await contract.symbol());
console.log("所有者:", await contract.owner());
console.log("IRYS 代币:", await contract.irysToken());
console.log("Mint 价格:", ethers.utils.formatEther(await contract.mintPrice()));
```

## 🔗 合约交互

### 用户 Mint 流程
1. **授权 IRYS 代币**:
```javascript
const irysToken = await ethers.getContractAt("IERC20", IRYS_TOKEN_ADDRESS);
await irysToken.approve(NFT_CONTRACT_ADDRESS, "10000000000000000"); // 0.01 IRYS
```

2. **铸造 NFT**:
```javascript
const nft = await ethers.getContractAt("IrysNFTSecure", NFT_CONTRACT_ADDRESS);
await nft.mint(userAddress, "ipfs://metadata-hash");
```

## 🛠️ 故障排除

### 常见问题

1. **Gas 费用不足**
   - 确保钱包有足够的 IRYS 代币支付 gas 费用

2. **私钥格式错误**
   - 确保私钥以 `0x` 开头
   - 私钥应该是 64 位十六进制字符串

3. **网络连接问题**
   - 检查 RPC URL 是否正确
   - 确认网络连接正常

4. **合约验证失败**
   - 检查合约地址是否正确
   - 确认构造函数参数匹配

## 📱 前端集成

部署完成后，可以在前端使用以下信息：

```javascript
const CONTRACT_CONFIG = {
  address: "YOUR_CONTRACT_ADDRESS",
  abi: [...], // 从 artifacts/contracts/IrysNFTSecure.sol/IrysNFTSecure.json 获取
  network: {
    chainId: 1270,
    name: "IRYS Testnet",
    rpcUrl: "https://testnet-rpc.irys.xyz/v1/execution-rpc"
  }
};
```

## 🎯 下一步

1. **上传图片到 IPFS**: `npm run upload`
2. **创建前端界面**
3. **测试完整用户流程**
4. **部署到主网**（准备就绪时）

## 📞 支持

如有问题，请检查：
- [IRYS 官方文档](https://docs.irys.xyz)
- [Hardhat 文档](https://hardhat.org/docs)
- 区块浏览器: https://explorer.irys.xyz
