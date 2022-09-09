const { expect } = require("chai");
const { loadFixture } = require("ethereum-waffle");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

let contract1;
let contract2;
describe("Multi Signature", function () {
  beforeEach(async()=>{
    const factory_Token = await ethers.getContractFactory("Token_Generation");
    const factory_MultiSig = await ethers.getContractFactory("Multi_Signature");
    const [owner,acct1, acct2] = await ethers.getSigners();


    contract1 = await factory_Token.deploy();
    contract2 = await factory_MultiSig.deploy(50);
  });
  // Checks if contract is deployed
  it('Should be deployable' , async ()=> {
    const [owner,acct1, acct2] = await ethers.getSigners();

    expect(await contract1.owner()).to.equal(owner.address);
    expect(await contract2.owner()).to.equal(owner.address);
  });

  it.only('Should be mintable' , async ()=> {
    const [owner,acct1, acct2] = await ethers.getSigners();
    await contract1.mint(acct1.address,1);
    const account1Balance = await contract1.balanceOf(acct1.address);
      expect(account1Balance).to.equal(1);
  });

  it('Should be able to add Signers' , async ()=> {
    const [owner,acct1, acct2] = await ethers.getSigners();
    await contract2.addSigners(acct1.address);
    let count = await contract2.totalSigner();
    console.log("Total Count: ", count);
    expect(count).to.equal(1);
  });

  it('Should be able to remove Signers' , async ()=> {
    const [owner,acct1, acct2] = await ethers.getSigners();
    await contract2.addSigners(acct1.address);
    await contract2.removeSigners(acct1.address);
    let count = await contract2.totalSigner();
    console.log("Total Count: ", count);
    expect(count).to.equal(0);
  });

  it('Should be able to submit,vote and finalize a transaction' , async ()=> {
    const [owner,acct1, acct2] = await ethers.getSigners();
    await contract2.addSigners(acct1.address);
    await contract1.mint(contract2.address,1);
    await contract2.supplyETH({value: '1000000000000000000'});
    
    await contract2.createTransactionETH(acct1.address , parseEther("0.1"));
    await contract2.createTransactioERC20(acct1.address , 1, contract1.address );
    await contract2.approveTransaction(0);
   await contract2.approveTransaction(1);
   
   await contract2.finalizeTransaction(0);
    await contract2.finalizeTransaction(1);

    expect(await contract2.isTransactionCompleted(0)).to.equal(true);
    expect(await contract2.isTransactionCompleted(1)).to.equal(true);
  });

  it.only('Should be able to submit,vote and finalize a transaction' , async ()=> {
    const [owner,acct1, acct2] = await ethers.getSigners();
    await contract2.addSigners(acct1.address);
    await contract1.mint(contract2.address,1);
    await contract2.supplyETH({value: '1000000000000000000'});
    
    await contract2.createTransactionETH(acct1.address , parseEther("0.1"));
    await contract2.createTransactioERC20(acct1.address , 1, contract1.address );
    await contract2.approveTransaction(0);
   await contract2.approveTransaction(1);
 

    expect(await contract2.isTransactionCompleted(0)).to.equal(false);
    expect(await contract2.isTransactionCompleted(1)).to.equal(false);
  });


 
});

