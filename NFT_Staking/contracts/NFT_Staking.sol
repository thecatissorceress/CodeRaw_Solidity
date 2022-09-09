// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/*
NFT Staking
- Create your own NFT with a max supply of 100
- Set lock in period
- Specify an NFT (address) to be allowed for staking. 1 address only
- Stake method should transfer the NFT from user's wallet to stake contract 
- Stake method should transfer the NFT from user's wallet to stake contract
- User should earn .001 eth every block while NFT is staked
- User should only be allowed to unstake the NFT after the lock-in period
- ETH rewards accumulation should stop after the user unstaked the NFT
- User should be able to claim the rewards only after unstaking the NFT
*/


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT_Token is Ownable, ERC721 {
    // NFT max supply of 100
    uint public maxSupply = 100;
    uint public tokenId = 0;
    uint public currentSupply = 0;

    constructor() ERC721("NFT_Token", "NFTT") {}
    
    function mint() public {
        uint totalMinted = currentSupply;
        require(totalMinted < maxSupply, "ERC721: minting limit reached");
        _safeMint(msg.sender, totalMinted);
        currentSupply += 1;
    }
}

contract NFTStaking is IERC721Receiver, Ownable {
    uint public startTime;
    uint public endTime;

    address public nftContract;

    mapping(uint => address) public ownerOfStakedNFTs;
    mapping(uint => uint) public blockWhenNFTStaked;

    constructor(address _nftContract) payable {
        nftContract = _nftContract;
        // We allow ^ to be staked
    }

    function stake(uint _tokenId) public {
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);
        ownerOfStakedNFTs[_tokenId] = msg.sender;
        blockWhenNFTStaked[_tokenId] = block.number;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public override pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function setLockinPeriod(uint _start, uint _end) public {
        require(_end > _start, "End Date should be greater than start date");
        startTime = _start;
        endTime = _end;
    }

    function unstake(uint _tokenId) public payable {
        require(ownerOfStakedNFTs[_tokenId] == msg.sender, "You are not the owner of this NFT");
        require(block.timestamp > endTime, "You can unstake only after the lock-in period");

        delete ownerOfStakedNFTs[_tokenId];
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, _tokenId);

        // reward the staker with appropriate amount of ETH
        uint blockNumberNow = block.number;
        uint blockNumberDuration = blockNumberNow - blockWhenNFTStaked[_tokenId];

        uint reward = blockNumberDuration * 0.001 ether;

        payable(msg.sender).transfer(reward);
    }

}


