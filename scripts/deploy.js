const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 开始部署 Valentine NFT 合约到 IRYS Testnet...\n");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // 检查环境变量
  const ownerAddress = process.env.OWNER_ADDRESS || deployer.address;

  console.log("👑 合约所有者:", ownerAddress);
  console.log("📛 NFT 名称:", process.env.NFT_NAME || "Valentine Collection");
  console.log("🔤 NFT 符号:", process.env.NFT_SYMBOL || "VALENTINE");
  console.log("💎 Mint 价格: 0 (免费铸造)\n");

  // 部署合约
  console.log("⏳ 正在部署合约...");
  const IrysNFTSecure = await ethers.getContractFactory("IrysNFTSecure");
  
  const nft = await IrysNFTSecure.deploy(
    process.env.NFT_NAME || "Valentine Collection",
    process.env.NFT_SYMBOL || "VALENTINE", 
    ownerAddress
  );

  await nft.waitForDeployment();

  const contractAddress = await nft.getAddress();
  console.log("✅ 合约部署成功!");
  console.log("📍 合约地址:", contractAddress);
  console.log("🌐 区块链浏览器:", `https://explorer.irys.xyz/address/${contractAddress}\n`);

  // 验证部署
  console.log("🔍 验证部署...");
  const name = await nft.name();
  const symbol = await nft.symbol();
  const owner = await nft.owner();
  const mintPrice = await nft.mintPrice();
  const maxSupply = await nft.maxSupply();
  const maxMintPerAddress = await nft.maxMintPerAddress();

  console.log("📋 合约信息:");
  console.log("  - 名称:", name);
  console.log("  - 符号:", symbol);
  console.log("  - 所有者:", owner);
  console.log("  - Mint 价格:", mintPrice.toString(), "(免费铸造)");
  console.log("  - 最大供应量:", maxSupply.toString());
  console.log("  - 每地址最大铸造:", maxMintPerAddress.toString(), "\n");

  // 保存部署信息
  const deploymentInfo = {
    network: "irysTestnet",
    chainId: 1270,
    contractAddress: contractAddress,
    deployer: deployer.address,
    owner: owner,
    mintPrice: mintPrice.toString(),
    maxSupply: maxSupply.toString(),
    maxMintPerAddress: maxMintPerAddress.toString(),
    deploymentTime: new Date().toISOString(),
    transactionHash: nft.deploymentTransaction().hash,
    blockNumber: nft.deploymentTransaction().blockNumber
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 部署信息已保存到 deployment-info.json");

  console.log("\n🎉 部署完成! 现在可以开始免费铸造 Valentine NFT 了!");
  console.log("📖 下一步:");
  console.log("  1. 测试免费铸造功能");
  console.log("  2. 创建前端界面进行 mint");
  console.log("  3. 分享给用户进行免费铸造");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
