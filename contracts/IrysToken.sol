// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IrysToken
 * @dev IRYS 代币合约，用于 NFT 铸造支付
 */
contract IrysToken is ERC20, Ownable {
    constructor() ERC20("Irys Token", "IRYS") Ownable(msg.sender) {
        // 铸造 1,000,000 个代币给部署者
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    /**
     * @dev 铸造新代币（仅所有者）
     * @param to 接收地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev 销毁代币
     * @param amount 销毁数量
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
