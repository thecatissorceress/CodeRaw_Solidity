// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + async function deploy_NFTStaking(){

    console.log("Deploying NFTStaking...");
    console.log("------------------------------------------------------");
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const NFTStaking = await ethers.getContractFactory("NFTStaking");
    const contract = await NFTStaking.deploy();
    await contract.deployed();
  
    console.log("[NFTStaking] address:", contract.address);
  
    return contract.address;
  
  }
  
  async function deploy_NFTStaking(token_address){
  
    console.log("Deploying NFTStaking...");
    console.log("------------------------------------------------------");
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const NFTStaking = await ethers.getContractFactory("NFTStaking");
    const contract = await NFTStaking.deploy(token_address);
    await contract.deployed();
  
    console.log("[NFTStaking] address:", contract.address);
  
    return contract.address;
  
  }
  
  async function main() {
    console.log("\n");
    console.log("============================================================");
    console.log("Deploying contracts...");
    console.log();
    let NFTStaking_address = await deploy_NFTStaking();
    console.log();
    await deploy_NFTStaking(NFTStaking_address);
    console.log();
    console.log("============================================================");
    console.log("\n");
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });ONE_YEAR_IN_SECS;

  const lockedAmount = hre.ethers.utils.parseEther("1");

  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.deployed();

  console.log(
    `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
