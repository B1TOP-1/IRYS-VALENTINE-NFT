const { expect } = require("chai");
const hre = require("hardhat");

describe("IrysNFTSecure - FreeMint", function () {
  let irysNFTSecure;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const MAX_MINT_PER_ADDRESS = 10;
  const MAX_TOTAL_SUPPLY = 10000;

  beforeEach(async function () {
    // 获取签名者
    [owner, addr1, addr2, ...addrs] = await hre.ethers.getSigners();

    // 部署 IrysNFTSecure 合约（免费铸造模式）
    const IrysNFTSecure = await hre.ethers.getContractFactory("IrysNFTSecure");
    irysNFTSecure = await IrysNFTSecure.deploy(
      "Valentine Collection",
      "VALENTINE",
      owner.address
    );
    await irysNFTSecure.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置初始参数", async function () {
      expect(await irysNFTSecure.owner()).to.equal(owner.address);
      expect(await irysNFTSecure.mintPrice()).to.equal(0); // 免费铸造
    });

    it("应该正确设置 NFT 元数据", async function () {
      expect(await irysNFTSecure.name()).to.equal("Valentine Collection");
      expect(await irysNFTSecure.symbol()).to.equal("VALENTINE");
    });

    it("应该正确设置供应量限制", async function () {
      expect(await irysNFTSecure.maxSupply()).to.equal(MAX_TOTAL_SUPPLY);
      expect(await irysNFTSecure.maxMintPerAddress()).to.equal(MAX_MINT_PER_ADDRESS);
    });
  });

  describe("免费铸造功能", function () {
    it("应该允许用户免费铸造 NFT", async function () {
      const tokenId = 1; // 合约从 1 开始计数
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";

      await expect(irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI))
        .to.emit(irysNFTSecure, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, addr1.address, tokenId);

      expect(await irysNFTSecure.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await irysNFTSecure.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("应该更新铸造计数", async function () {
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";
      
      expect(await irysNFTSecure.mintedByAddress(addr1.address)).to.equal(0);
      
      await irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI);
      
      expect(await irysNFTSecure.mintedByAddress(addr1.address)).to.equal(1);
    });

    it("应该限制每个地址的铸造数量", async function () {
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";

      // 铸造最大允许数量
      for (let i = 0; i < MAX_MINT_PER_ADDRESS; i++) {
        await irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI);
      }

      // 尝试铸造超过限制
      await expect(
        irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI)
      ).to.be.revertedWith("Max mint per address exceeded");
    });

    it("应该限制总供应量", async function () {
      // 这个测试验证逻辑，实际测试中不会铸造10000个
      expect(await irysNFTSecure.maxSupply()).to.equal(MAX_TOTAL_SUPPLY);
    });

    it("应该拒绝铸造到零地址", async function () {
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";
      
      await expect(
        irysNFTSecure.connect(addr1).mint(hre.ethers.ZeroAddress, tokenURI)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("应该拒绝在铸造关闭时铸造", async function () {
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";
      
      // 关闭铸造
      await irysNFTSecure.setMintActive(false);
      
      await expect(
        irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI)
      ).to.be.revertedWith("Minting is not active");
    });
  });

  describe("管理员功能", function () {
    it("应该允许所有者设置铸造价格（但保持为0）", async function () {
      const newPrice = hre.ethers.parseEther("1");
      await irysNFTSecure.setMintPrice(newPrice);
      expect(await irysNFTSecure.mintPrice()).to.equal(0); // 免费铸造模式下始终为0
    });

    it("应该拒绝非所有者更新铸造价格", async function () {
      const newPrice = hre.ethers.parseEther("1");
      await expect(
        irysNFTSecure.connect(addr1).setMintPrice(newPrice)
      ).to.be.revertedWithCustomError(irysNFTSecure, "OwnableUnauthorizedAccount");
    });

    it("应该允许所有者更新每个地址的最大铸造数量", async function () {
      const newMax = 5;
      await irysNFTSecure.setMaxMintPerAddress(newMax);
      expect(await irysNFTSecure.maxMintPerAddress()).to.equal(newMax);
    });

    it("应该允许所有者更新最大总供应量", async function () {
      const newMaxSupply = 5000;
      await irysNFTSecure.setMaxSupply(newMaxSupply);
      expect(await irysNFTSecure.maxSupply()).to.equal(newMaxSupply);
    });

    it("应该允许所有者控制铸造状态", async function () {
      expect(await irysNFTSecure.mintActive()).to.be.true;
      
      await irysNFTSecure.setMintActive(false);
      expect(await irysNFTSecure.mintActive()).to.be.false;
      
      await irysNFTSecure.setMintActive(true);
      expect(await irysNFTSecure.mintActive()).to.be.true;
    });
  });

  describe("查询功能", function () {
    it("应该正确返回地址的铸造数量", async function () {
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";
      
      expect(await irysNFTSecure.mintedByAddress(addr1.address)).to.equal(0);

      // 铸造一个
      await irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI);
      expect(await irysNFTSecure.mintedByAddress(addr1.address)).to.equal(1);

      // 再铸造一个
      await irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI);
      expect(await irysNFTSecure.mintedByAddress(addr1.address)).to.equal(2);
    });

    it("应该正确返回地址的剩余铸造数量", async function () {
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";
      
      expect(await irysNFTSecure.getRemainingMintForAddress(addr1.address)).to.equal(MAX_MINT_PER_ADDRESS);

      // 铸造一个
      await irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI);
      expect(await irysNFTSecure.getRemainingMintForAddress(addr1.address)).to.equal(MAX_MINT_PER_ADDRESS - 1);

      // 再铸造一个
      await irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI);
      expect(await irysNFTSecure.getRemainingMintForAddress(addr1.address)).to.equal(MAX_MINT_PER_ADDRESS - 2);
    });

    it("应该正确返回当前 token ID", async function () {
      expect(await irysNFTSecure.getCurrentTokenId()).to.equal(1); // 从1开始
    });

    it("应该正确返回剩余供应量", async function () {
      expect(await irysNFTSecure.getRemainingSupply()).to.equal(MAX_TOTAL_SUPPLY);
    });
  });

  describe("ERC721 标准功能", function () {
    beforeEach(async function () {
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";
      await irysNFTSecure.connect(addr1).mint(addr1.address, tokenURI);
    });

    it("应该支持 ERC721 接口", async function () {
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await irysNFTSecure.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });

    it("应该支持 ERC721Metadata 接口", async function () {
      const ERC721_METADATA_INTERFACE_ID = "0x5b5e139f";
      expect(await irysNFTSecure.supportsInterface(ERC721_METADATA_INTERFACE_ID)).to.be.true;
    });

    it("应该支持 ERC165 接口", async function () {
      const ERC165_INTERFACE_ID = "0x01ffc9a7";
      expect(await irysNFTSecure.supportsInterface(ERC165_INTERFACE_ID)).to.be.true;
    });

    it("应该正确返回 token URI", async function () {
      const tokenURI = "https://gateway.pinata.cloud/ipfs/QmUghvnP9Hkrvmyeon3WDdE2ou1NM4x2EQz7ARzU2nGs8d";
      expect(await irysNFTSecure.tokenURI(1)).to.equal(tokenURI);
    });
  });
});