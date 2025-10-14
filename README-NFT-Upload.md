# Valentine NFT 上传指南

## 📸 图片上传到 IPFS

### 1. 准备工作

#### 1.1 获取 Pinata API 密钥
1. 访问 [Pinata.cloud](https://pinata.cloud)
2. 注册并登录账户
3. 进入 API Keys 页面
4. 创建新的 API 密钥，记录：
   - `API Key`
   - `API Secret`

#### 1.2 安装依赖
```bash
npm install
```

#### 1.3 配置 API 密钥
编辑 `upload-to-pinata.js` 文件，替换：
```javascript
const PINATA_API_KEY = 'your_pinata_api_key_here';
const PINATA_SECRET_API_KEY = 'your_pinata_secret_api_key_here';
```

### 2. 运行上传脚本

```bash
npm run upload
```

脚本将自动：
- ✅ 上传所有 13 张 Valentine 图片到 IPFS
- ✅ 为每张图片创建对应的 NFT 元数据
- ✅ 上传元数据到 IPFS
- ✅ 生成 `nft-upload-results.json` 结果文件

### 3. 预期结果

上传完成后，您将获得：

#### 3.1 图片列表
1. **Conversation** - 对话气泡
2. **Gift Box** - 礼品盒
3. **Heart Double** - 双心
4. **Heart** - 爱心
5. **Key** - 钥匙
6. **Lock** - 锁
7. **Mail Box** - 邮箱
8. **Message** - 消息
9. **Phone** - 电话
10. **Position** - 位置
11. **Target** - 目标
12. **Unlock** - 解锁
13. **Valentine Surprise** - 情人节惊喜

#### 3.2 每个 NFT 包含
- **唯一的 IPFS 图片链接**
- **完整的元数据 JSON**
- **属性和稀有度信息**

## 🎯 使用 IRYS 代币的 NFT 合约

### 合约特性
- ✅ **只接受 IRYS ERC20 代币支付**
- ✅ **Mint 价格：0.01 IRYS**
- ✅ **最大供应量：10,000 NFT**
- ✅ **每地址最大 mint：10 个**

### 部署步骤

#### 1. 部署合约参数
```solidity
constructor(
    "Valentine Collection",     // name
    "VALENTINE",               // symbol  
    "0xYourAddress",          // initialOwner
    "0xIRYS_TOKEN_ADDRESS"    // IRYS ERC20 代币地址
)
```

#### 2. 用户 Mint 流程
1. **获取 IRYS 代币**
2. **授权合约使用代币**：
   ```javascript
   await irysToken.approve(nftContract.address, mintPrice);
   ```
3. **执行 Mint**：
   ```javascript
   await nftContract.mint(userAddress, metadataURI);
   ```

### 合约函数

#### 用户函数
- `mint(address to, string tokenURI)` - Mint NFT
- `getUserIrysBalance(address user)` - 查询用户 IRYS 余额
- `getUserIrysAllowance(address user)` - 查询用户授权额度

#### 管理员函数
- `setMintPrice(uint256 newPrice)` - 设置价格
- `requestWithdrawal()` - 请求提取 IRYS 代币
- `withdrawTo(address recipient)` - 提取到指定地址

## 🔒 安全特性

1. **ERC20 代币支付** - 只接受 IRYS 代币
2. **两步提款模式** - 防止资金锁定
3. **重入攻击防护** - ReentrancyGuard
4. **溢出保护** - Solidity 0.8+
5. **接收方验证** - 确保 mint 到有效地址

## 📊 示例元数据

```json
{
  "name": "Valentine Heart #1",
  "description": "A beautiful 3D Valentine's Day themed NFT featuring heart. Part of the exclusive Valentine Collection.",
  "image": "ipfs://QmYourImageHash",
  "external_url": "https://your-website.com",
  "attributes": [
    {
      "trait_type": "Category",
      "value": "Valentine"
    },
    {
      "trait_type": "Style",
      "value": "3D"
    },
    {
      "trait_type": "Theme", 
      "value": "Heart"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
```

## 🚀 部署后的使用

1. **配置前端界面**连接到合约
2. **集成 IRYS 代币支付**流程
3. **使用上传的元数据 URI**进行 mint
4. **在 OpenSea 等市场**展示 NFT

现在您有了完整的 Valentine NFT 系统，使用 IRYS 代币支付！🎉



