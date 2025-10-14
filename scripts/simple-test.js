const { ethers } = require("hardhat");
require("dotenv").config({ path: "./env.local" });

async function main() {
  console.log("🧪 简单测试 Valentine NFT 免费铸造功能...\n");

  // 获取部署信息
  const deploymentInfo = require("../deployment-info.json");
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("📋 合约信息:");
  console.log("  - 合约地址:", contractAddress);
  console.log("  - 网络:", deploymentInfo.network);
  console.log("  - 最大供应量:", deploymentInfo.maxSupply);
  console.log("  - 每地址最大铸造:", deploymentInfo.maxMintPerAddress);
  console.log("  - Mint 价格:", deploymentInfo.mintPrice, "ETH (免费)\n");

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("👤 测试账户:", deployer.address, "\n");

  // 连接合约
  const IrysNFTSecure = await ethers.getContractFactory("IrysNFTSecure");
  const nft = IrysNFTSecure.attach(contractAddress);

  try {
    // 测试1: 检查合约基本信息
    console.log("🔍 测试1: 检查合约基本信息");
    const name = await nft.name();
    const symbol = await nft.symbol();
    const currentTokenId = await nft.getCurrentTokenId();
    const maxSupply = await nft.maxSupply();
    const mintPrice = await nft.mintPrice();
    const maxMintPerAddress = await nft.maxMintPerAddress();
    const owner = await nft.owner();
    const mintActive = await nft.mintActive();

    console.log("  ✅ 合约信息:");
    console.log("    - 名称:", name);
    console.log("    - 符号:", symbol);
    console.log("    - 当前Token ID:", currentTokenId.toString());
    console.log("    - 最大供应量:", maxSupply.toString());
    console.log("    - Mint 价格:", ethers.formatEther(mintPrice), "ETH");
    console.log("    - 每地址最大铸造:", maxMintPerAddress.toString());
    console.log("    - 合约所有者:", owner);
    console.log("    - 铸造状态:", mintActive);

    // 测试2: 免费铸造单个NFT
    console.log("\n🎯 测试2: 免费铸造单个NFT");
    const tokenURI = "https://gateway.pinata.cloud/ipfs/QmTestTokenURI1";
    console.log("  ⏳ 正在铸造NFT...");
    
    const mintTx = await nft.connect(deployer).mint(deployer.address, tokenURI);
    console.log("  📝 交易哈希:", mintTx.hash);
    
    const receipt = await mintTx.wait();
    console.log("  ✅ 铸造成功! Gas 使用:", receipt.gasUsed.toString());
    
    // 检查铸造后的状态
    const newCurrentTokenId = await nft.getCurrentTokenId();
    const userBalance = await nft.balanceOf(deployer.address);
    const userMintCount = await nft.mintedByAddress(deployer.address);
    
    console.log("  📊 铸造后状态:");
    console.log("    - 新的当前Token ID:", newCurrentTokenId.toString());
    console.log("    - 用户余额:", userBalance.toString());
    console.log("    - 用户铸造次数:", userMintCount.toString());
    
    // 获取NFT的tokenId和URI
    const tokenId = newCurrentTokenId - 1; // 刚铸造的NFT ID
    const actualTokenURI = await nft.tokenURI(tokenId);
    console.log("    - 最新NFT Token ID:", tokenId.toString());
    console.log("    - NFT URI:", actualTokenURI);

    // 测试3: 铸造第二个NFT
    console.log("\n🎯 测试3: 铸造第二个NFT");
    const tokenURI2 = "https://gateway.pinata.cloud/ipfs/QmTestTokenURI2";
    console.log("  ⏳ 正在铸造第二个NFT...");
    
    const mintTx2 = await nft.connect(deployer).mint(deployer.address, tokenURI2);
    console.log("  📝 交易哈希:", mintTx2.hash);
    
    const receipt2 = await mintTx2.wait();
    console.log("  ✅ 第二个NFT铸造成功! Gas 使用:", receipt2.gasUsed.toString());
    
    // 最终状态
    const finalCurrentTokenId = await nft.getCurrentTokenId();
    const finalUserBalance = await nft.balanceOf(deployer.address);
    const finalUserMintCount = await nft.mintedByAddress(deployer.address);
    
    console.log("\n📊 最终状态:");
    console.log("  - 当前Token ID:", finalCurrentTokenId.toString());
    console.log("  - 用户余额:", finalUserBalance.toString());
    console.log("  - 用户铸造次数:", finalUserMintCount.toString());
    
    // 显示所有NFT
    console.log("\n🎨 所有铸造的NFT:");
    const totalMinted = finalCurrentTokenId - 1;
    for (let i = 1; i <= totalMinted; i++) {
      try {
        const owner = await nft.ownerOf(i);
        const tokenURI = await nft.tokenURI(i);
        console.log(`    - Token ID ${i}: 所有者 ${owner}`);
        console.log(`       URI: ${tokenURI}`);
      } catch (error) {
        console.log(`    - Token ID ${i}: 获取信息失败`);
      }
    }

    console.log("\n🎉 免费铸造功能测试完成! 所有测试都通过了!");

  } catch (error) {
    console.log("❌ 测试失败:", error.message);
    console.log("错误详情:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });
