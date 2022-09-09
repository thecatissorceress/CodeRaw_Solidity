const { expect } = require("chai");
const { loadFixture } = require("ethereum-waffle");
const { ethers } = require("hardhat");

let contract;

describe("ERC1155", function () {
  beforeEach(async()=>{
    const factory = await ethers.getContractFactory("ERC1155Token");
    const [owner, account1, account2, account3] = await ethers.getSigners();


    contract = await factory.deploy(account1.address);
  });
  // Checks if contract is deployed
  it('Should be deployable' , async ()=> {
    const [owner,account1] = await ethers.getSigners();

    expect(await contract.owner()).to.equal(owner.address);
  });

  it('Should mint', async()=>{
    const [owner,account1] = await ethers.getSigners();
    await contract.mint("www.facebook.com");
   let balance =  await contract.balanceOf(account1.address,0);
   //console.log(balance.toString());
   expect(balance).to.equal(1);
  });

  it('Should be able to view uri', async()=>{
    await contract.mint("www.facebook.com");

    let UrI = await contract.uri(1);

    expect(UrI).to.equal(await contract.baseURI(0) + "/1.json");
   // console.log("URL: ",UrI)
  });

  it('Should be able to change URI', async()=>{
    await contract.mint("www.facebook.com");

   await contract.changeBaseURI(1, "www.instagram.com");

   let UrI = await contract.uri(1);

    expect(UrI).to.equal(await contract.baseURI(0) + "/1.json");
  });

  it('Should be able to change Treasury', async()=>{
    const [owner,account1] = await ethers.getSigners();
    await contract.updateTreasury(owner.address);

    let treasury = await contract.treasury();


    expect(treasury).to.equal(owner.address)

  });
});

