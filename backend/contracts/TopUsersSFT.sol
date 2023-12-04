// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TopUsersSFT is ERC1155, Ownable {

    constructor() ERC1155("https://ipfs.io/bafybeicll33pzrm3ohuljsdtnfzql57sorgmo73meoebagpbl32z2cuk5a/{id}.json") Ownable(msg.sender) {}
    
    function mintOne(address _user, uint256 _id) public onlyOwner {
        require(_user != address(0), "Invalid address");
        require((_id >= 202312) && (_id <= 202612) && (_id % 100 >= 1) && (_id % 100 <= 12), "Invalid ID");
        _mint(_user, _id, 1, "");
    }
}