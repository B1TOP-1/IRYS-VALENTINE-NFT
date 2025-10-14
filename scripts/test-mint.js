const { ethers } = require("hardhat");
require("dotenv").config({ path: "./env.local" });

async function main() {
  console.log("🧪 开始测试 Valentine NFT 免费铸造功能...\n");

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
  console.log("👤 测试账户:");
  console.log("  - 部署者:", deployer.address);
  console.log("  - 将使用部署者账户进行所有测试\n");

  // 连接合约
  const IrysNFTSecure = await ethers.getContractFactory("IrysNFTSecure");
  const nft = IrysNFTSecure.attach(contractAddress);

  // 测试1: 检查合约基本信息
  console.log("🔍 测试1: 检查合约基本信息");
  try {
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
  } catch (error) {
    console.log("  ❌ 获取合约信息失败:", error.message);
  }

  // 测试2: 免费铸造单个NFT
  console.log("\n🎯 测试2: 免费铸造单个NFT");
  try {
    console.log("  ⏳ 正在铸造NFT给部署者...");
    const tokenURI = "https://gateway.pinata.cloud/ipfs/QmYourTokenURI1";
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
    
  } catch (error) {
    console.log("  ❌ 铸造失败:", error.message);
  }

  // 测试3: 批量铸造
  console.log("\n🎯 测试3: 批量铸造 (3个NFT)");
  try {
    console.log("  ⏳ 正在批量铸造3个NFT给部署者...");
    
    // 逐个铸造3个NFT
    for (let i = 1; i <= 3; i++) {
      const tokenURI = `https://gateway.pinata.cloud/ipfs/QmYourTokenURI${i + 1}`;
      const mintTx = await nft.connect(deployer).mint(deployer.address, tokenURI);
      console.log(`    - 铸造第${i}个NFT，交易哈希:`, mintTx.hash);
      
      const receipt = await mintTx.wait();
      console.log(`    - 第${i}个NFT铸造成功! Gas 使用:`, receipt.gasUsed.toString());
    }
    
    // 检查批量铸造后的状态
    const newCurrentTokenId = await nft.getCurrentTokenId();
    const userBalance = await nft.balanceOf(deployer.address);
    const userMintCount = await nft.mintedByAddress(deployer.address);
    
    console.log("  📊 批量铸造后状态:");
    console.log("    - 新的当前Token ID:", newCurrentTokenId.toString());
    console.log("    - 用户余额:", userBalance.toString());
    console.log("    - 用户铸造次数:", userMintCount.toString());
    
  } catch (error) {
    console.log("  ❌ 批量铸造失败:", error.message);
  }

  // 测试4: 测试更多铸造
  console.log("\n🎯 测试4: 测试更多铸造");
  try {
    console.log("  ⏳ 正在铸造更多NFT给部署者...");
    
    // 铸造2个更多NFT
    for (let i = 1; i <= 2; i++) {
      const tokenURI = `https://gateway.pinata.cloud/ipfs/QmYourTokenURI${i + 4}`;
      const mintTx = await nft.connect(deployer).mint(deployer.address, tokenURI);
      console.log(`    - 铸造第${i}个NFT，交易哈希:`, mintTx.hash);
      
      const receipt = await mintTx.wait();
      console.log(`    - 第${i}个NFT铸造成功! Gas 使用:`, receipt.gasUsed.toString());
    }
    
    // 检查状态
    const userBalance = await nft.balanceOf(deployer.address);
    const userMintCount = await nft.mintedByAddress(deployer.address);
    
    console.log("  📊 当前状态:");
    console.log("    - 用户余额:", userBalance.toString());
    console.log("    - 用户铸造次数:", userMintCount.toString());
    
  } catch (error) {
    console.log("  ❌ 铸造失败:", error.message);
  }

  // 测试5: 测试铸造限制
  console.log("\n🎯 测试5: 测试铸造限制 (尝试超过每地址限制)");
  try {
    const maxMintPerAddress = await nft.maxMintPerAddress();
    const userMintCount = await nft.mintedByAddress(deployer.address);
    const remainingMints = maxMintPerAddress - userMintCount;
    
    console.log("  📊 当前状态:");
    console.log("    - 每地址最大铸造:", maxMintPerAddress.toString());
    console.log("    - 用户已铸造:", userMintCount.toString());
    console.log("    - 剩余可铸造:", remainingMints.toString());
    
    if (remainingMints > 0) {
      console.log("  ⏳ 尝试铸造剩余数量...");
      for (let i = 1; i <= remainingMints; i++) {
        const tokenURI = `https://gateway.pinata.cloud/ipfs/QmYourTokenURI${i + 6}`;
        const mintTx = await nft.connect(deployer).mint(deployer.address, tokenURI);
        const receipt = await mintTx.wait();
        console.log(`    - 铸造第${i}个NFT成功! Gas 使用:`, receipt.gasUsed.toString());
      }
      
      // 尝试超额铸造
      console.log("  ⏳ 尝试超额铸造 (应该失败)...");
      try {
        const excessTokenURI = "https://gateway.pinata.cloud/ipfs/QmExcessTokenURI";
        await nft.connect(deployer).mint(deployer.address, excessTokenURI);
        console.log("  ❌ 超额铸造应该失败但没有失败!");
      } catch (excessError) {
        console.log("  ✅ 超额铸造正确失败:", excessError.message);
      }
    } else {
      console.log("  ⏳ 尝试超额铸造 (应该失败)...");
      try {
        const excessTokenURI = "https://gateway.pinata.cloud/ipfs/QmExcessTokenURI";
        await nft.connect(deployer).mint(deployer.address, excessTokenURI);
        console.log("  ❌ 超额铸造应该失败但没有失败!");
      } catch (excessError) {
        console.log("  ✅ 超额铸造正确失败:", excessError.message);
      }
    }
    
  } catch (error) {
    console.log("  ❌ 测试铸造限制失败:", error.message);
  }

  // 测试6: 检查NFT所有权和转移
  console.log("\n🎯 测试6: 检查NFT所有权和转移");
  try {
    const currentTokenId = await nft.getCurrentTokenId();
    if (currentTokenId > 1) { // 有铸造的NFT
      const tokenId = 1; // 第一个NFT
      const owner = await nft.ownerOf(tokenId);
      console.log("  📊 NFT所有权:");
      console.log("    - Token ID:", tokenId.toString());
      console.log("    - 当前所有者:", owner);
      
      // 检查NFT URI
      const tokenURI = await nft.tokenURI(tokenId);
      console.log("    - NFT URI:", tokenURI);
      
      // 测试转移NFT (从部署者转移给自己，验证转移功能)
      if (owner === deployer.address && currentTokenId > 2) {
        console.log("  ⏳ 正在测试NFT转移功能...");
        const transferTx = await nft.connect(deployer).transferFrom(
          deployer.address, 
          deployer.address, 
          tokenId
        );
        const receipt = await transferTx.wait();
        console.log("  ✅ 转移成功! Gas 使用:", receipt.gasUsed.toString());
        
        // 验证转移
        const newOwner = await nft.ownerOf(tokenId);
        console.log("    - 新所有者:", newOwner);
      }
    } else {
      console.log("  ⚠️ 没有NFT可供测试转移");
    }
  } catch (error) {
    console.log("  ❌ 测试NFT所有权失败:", error.message);
  }

  // 最终状态报告
  console.log("\n📊 最终状态报告:");
  try {
    const finalCurrentTokenId = await nft.getCurrentTokenId();
    const userBalance = await nft.balanceOf(deployer.address);
    const userMintCount = await nft.mintedByAddress(deployer.address);
    const maxSupply = await nft.maxSupply();
    const remainingSupply = await nft.getRemainingSupply();
    
    console.log("  - 当前Token ID:", finalCurrentTokenId.toString());
    console.log("  - 最大供应量:", maxSupply.toString());
    console.log("  - 剩余供应量:", remainingSupply.toString());
    console.log("  - 用户余额:", userBalance.toString());
    console.log("  - 用户铸造次数:", userMintCount.toString());
    
    // 显示所有NFT的Token ID
    console.log("\n🎨 所有铸造的NFT:");
    const totalMinted = finalCurrentTokenId - 1; // 减去初始值1
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
    
  } catch (error) {
    console.log("  ❌ 获取最终状态失败:", error.message);
  }

  console.log("\n🎉 免费铸造功能测试完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });
