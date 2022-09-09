async function deployERC1155(){
  console.log("Deploying address")
  console.log("**********************************");
  const factory = await ethers.getContractFactory("ERC1155Token");

  
  let contract = await factory.deploy("0x56d41F8eC2759A1C183b6DF4dF8af5F0233fb6b0");

  console.log("Contract Treasury: ", await contract.treasury());

  console.log("Contract Address: ", contract.address)
}

deployERC1155()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});