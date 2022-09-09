const { expect } = require("chai");
const { loadFixture } = require("ethereum-waffle");
const { ethers } = require("hardhat");

const Web3 = require("web3");

let staking;
let token;

describe("NFT_Token + NFTStaking", function () {

  beforeEach(async () => {
    // STEP 1 : CALL AND DEPLOY SCRIPTS HERE
    const NFT_Token = await ethers.getContractFactory("NFT_Token");
    token = await NFT_Token.deploy();
    // Double check if deployed
    await token.deployed();

    const NFTStaking = await ethers.getContractFactory("NFTStaking");

    staking = await NFTStaking.deploy(token.address, {
      value: ethers.utils.parseEther("1"),
    });

    await staking.deployed();
  });

  async function testFixture() {
    const [owner, acct1, acct2, acct3, acct4, acct5, acct6] =
      await ethers.getSigners();

    return { owner, acct1, acct2, acct3, acct4, acct5, acct6 };
  }

  // STEP 2 : WRITE TEST CASES HERE
  describe("NFT Staking", function () {

    it("should be deployable (and set the right owner)", async function () {
      const { owner } = await loadFixture(testFixture);
      expect(await token.owner()).to.equal(owner.address);
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("should be able to stake NFT", async function() {
      const { owner, acct1 } = await loadFixture(testFixture);

      // mint a token for the owner
      await token.mint();

      // approve token staking into the NFT_Staker address
      await token.setApprovalForAll(staking.address, true);

      expect(await token.ownerOf(0)).to.equal(owner.address);

      // stake the token
      await staking.stake(0);

      expect(await token.ownerOf(0)).to.equal(staking.address);

    });

    it("should be allowed to be unstaked", async function() {
      const { owner, acct1 } = await loadFixture(testFixture);

      // mint a token for the owner
      await token.mint();

      // approve token staking into the NFT_Staker address
      await token.setApprovalForAll(staking.address, true);

      const timeStart = Math.floor(+new Date() / 1000);
      const timeEnd = timeStart + 30;

      // set start and end time for staking
      await staking.setLockinPeriod(timeStart, timeEnd);

      // stake the token
      await staking.stake(0);

      // fast-forward to the end of staking period

      // Before unstaking, the owner should be the staking contract
      expect(await token.ownerOf(0)).to.equal(staking.address);

      // fast forward time here
      await ethers.provider.send("evm_increaseTime", [timeEnd-timeStart+5]);
      

      // simulate block event
      await ethers.provider.send("evm_mine");
      await ethers.provider.send("evm_mine");
      await ethers.provider.send("evm_mine");

      // unstake the token
      await staking.unstake(0);
      
      // After unstaking, the owner should be the original owner
      expect(await token.ownerOf(0)).to.equal(owner.address);

    });

  });

});