require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    irysTestnet: {
      url: "https://testnet-rpc.irys.xyz/v1/execution-rpc",
      chainId: 1270,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
  },
  etherscan: {
    apiKey: {
      irysTestnet: "your-api-key-here", // IRYS 测试网可能不需要 API key
    },
    customChains: [
      {
        network: "irysTestnet",
        chainId: 1270,
        urls: {
          apiURL: "https://explorer.irys.xyz/api",
          browserURL: "https://explorer.irys.xyz"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
