// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol"; // 已弃用，使用内置计数器
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title IrysNFTSecure
 * @dev 免费的 Valentine NFT 合约 - FreeMint
 * @notice 免费铸造，无需支付任何代币
 */
contract IrysNFTSecure is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Address for address;
    
    uint256 private _tokenIdCounter;
    
    // 免费铸造模式 - 无需代币支付
    uint256 public mintPrice = 0; // 免费铸造
    uint256 public maxMintPerAddress = 10;
    uint256 public maxSupply = 10000;
    bool public mintActive = true;
    
    // 免费铸造模式 - 无需代币相关功能
    
    mapping(address => uint256) public mintedByAddress;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        // 从 1 开始计数
        _tokenIdCounter++;
    }
    
    /**
     * @dev 免费 mint 函数 - FreeMint
     */
    function mint(address to, string memory uri) public nonReentrant {
        require(mintActive, "Minting is not active");
        require(to != address(0), "Cannot mint to zero address");
        require(mintedByAddress[to] < maxMintPerAddress, "Max mint per address exceeded");
        require(_tokenIdCounter <= maxSupply, "Max supply exceeded");
        
        // 检查接收方是否为合约，如果是合约则确保支持 ERC721
        if (to.code.length > 0) {
            require(
                IERC165(to).supportsInterface(type(IERC721Receiver).interfaceId),
                "Recipient contract does not support ERC721"
            );
        }
        
        uint256 tokenId = _tokenIdCounter;
        
        // 安全的计数器递增（避免溢出）
        unchecked {
            _tokenIdCounter = tokenId + 1;
        }
        
        // 更新状态变量
        mintedByAddress[to]++;
        
        // 执行免费 mint
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(to, tokenId, uri);
    }
    
    
    /**
     * @dev 设置 mint 价格（免费铸造模式下保持为0）
     */
    function setMintPrice(uint256 /* newPrice */) public onlyOwner {
        // 免费铸造模式，价格始终为0
        mintPrice = 0;
    }
    
    /**
     * @dev 设置 mint 状态
     */
    function setMintActive(bool active) public onlyOwner {
        mintActive = active;
    }
    
    /**
     * @dev 设置最大供应量
     */
    function setMaxSupply(uint256 newMaxSupply) public onlyOwner {
        require(newMaxSupply >= _tokenIdCounter, "Cannot set max supply below current supply");
        maxSupply = newMaxSupply;
    }
    
    /**
     * @dev 设置每个地址最大 mint 数量
     */
    function setMaxMintPerAddress(uint256 newMax) public onlyOwner {
        require(newMax > 0, "Max mint must be greater than 0");
        maxMintPerAddress = newMax;
    }
    
    /**
     * @dev 获取当前 token ID
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev 获取剩余可 mint 数量
     */
    function getRemainingSupply() public view returns (uint256) {
        return maxSupply - _tokenIdCounter + 1;
    }
    
    /**
     * @dev 检查地址剩余可 mint 数量
     */
    function getRemainingMintForAddress(address addr) public view returns (uint256) {
        return maxMintPerAddress - mintedByAddress[addr];
    }
    
    // Override functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
}
