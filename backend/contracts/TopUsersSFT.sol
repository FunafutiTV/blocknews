// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title An ERC1155 contract
/// @author Nathanael Kubski
/** 
 * @notice 
 * You can use this contract to create a very basic ERC1155 Semi-Fungible Token to reward the top users of the
 * SocialNetwork contract
 */ 
/** 
 * @dev 
 * This contract is using OpenZeppelin's ERC1155 contract as well as the Ownable contract, which means that the 
 * address deploying the contract will be the contract's "owner".
 * Only the owner will be able to mint a token
 *
 * This contract only has one function and one event and should only be used along with the SocialNetwork contract
 */ 
contract TopUsersSFT is ERC1155, Ownable {

    /// @notice This event will be emitted every time a SFT is minted
    /// @dev This event will be emitted whenever the mintOne function is executed
    /// @param user The address of the user minting the SFT
    /// @param id The ID of the minted SFT
    event Minted(address user, uint id);

    constructor() ERC1155("https://ipfs.io/ipfs/bafybeid5khcqzxjnrfxgg3jpy4ut7dzzjflrakzxd54552xbnqxuca5l2i/{id}.json") Ownable(msg.sender) {}
    
    /// @notice This event will be emitted every time a SFT is minted
    /// @dev This event will be emitted whenever the mintOne function is executed
    /// @param _user The address of the user minting the SFT
    /// @param _id The ID of the minted SFT
    /** 
     * @dev
     * This function will be reverted if not called by the owner
     * This function will be reverted if _user is the 0 address
     * This function will be reverted if _id doesn't correspond to a valid month between 12/2023 and 12/2026
     * This functions mints 1 token of the given _id to the given _user user the ERC1155 _mint function
     * This function emits a Minted event
     */
    function mintOne(address _user, uint256 _id) public onlyOwner {
        require(_user != address(0), "Invalid address");
        require((_id >= 202404) && (_id <= 202612) && (_id % 100 >= 1) && (_id % 100 <= 12), "Invalid ID");
        _mint(_user, _id, 1, "");
        emit Minted(_user, _id);
    }
}