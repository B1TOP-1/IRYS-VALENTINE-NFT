const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 调试合约连接问题...\n");

  try {
    // 1. 检查网络连接
    console.log("📡 检查网络连接...");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log(`✅ 网络连接成功: ${network.name} (Chain ID: ${network.chainId})`);

    // 2. 检查区块高度
    console.log("\n📊 检查最新区块...");
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ 最新区块: ${blockNumber}`);

    // 3. 检查账户余额
    console.log("\n💰 检查账户余额...");
    const [deployer] = await ethers.getSigners();
    const balance = await provider.getBalance(deployer.address);
    console.log(`✅ 账户 ${deployer.address} 余额: ${ethers.formatEther(balance)} ETH`);

    // 4. 读取部署信息
    console.log("\n📋 读取部署信息...");
    const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
    console.log(`✅ 合约地址: ${deploymentInfo.contractAddress}`);

    // 5. 检查合约代码
    console.log("\n🔍 检查合约代码...");
    const code = await provider.getCode(deploymentInfo.contractAddress);
    if (code === "0x") {
      console.log("❌ 合约代码为空 - 合约可能未部署或地址错误");
      return;
    } else {
      console.log(`✅ 合约代码存在 (${code.length} 字符)`);
    }

    // 6. 尝试直接调用合约
    console.log("\n🧪 尝试直接调用合约...");
    try {
      // 使用简单的 call 而不是 contract 实例
      const result = await provider.call({
        to: deploymentInfo.contractAddress,
        data: "0x06fdde03" // name() 函数的 selector
      });
      console.log(`✅ 直接调用成功: ${result}`);
    } catch (error) {
      console.log(`❌ 直接调用失败: ${error.message}`);
    }

    // 7. 检查交易状态
    console.log("\n🔍 检查部署交易...");
    if (deploymentInfo.transactionHash) {
      try {
        const tx = await provider.getTransaction(deploymentInfo.transactionHash);
        if (tx) {
          console.log(`✅ 交易存在，状态: ${tx.blockNumber ? '已确认' : '待确认'}`);
          if (tx.blockNumber) {
            const receipt = await provider.getTransactionReceipt(deploymentInfo.transactionHash);
            console.log(`✅ 交易确认，Gas 使用: ${receipt.gasUsed}`);
          }
        } else {
          console.log("❌ 交易不存在");
        }
      } catch (error) {
        console.log(`❌ 检查交易失败: ${error.message}`);
      }
    }

  } catch (error) {
    console.error("❌ 调试过程中出现错误:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
