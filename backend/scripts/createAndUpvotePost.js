const hre = require("hardhat");

async function main() {

    const socialNetwork = await ethers.getContractAt("SocialNetwork", "0x5FbDB2315678afecb367f032d93F642f64180aa3");

    const [addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
  
    await socialNetwork.connect(addr4).post("Premier post sur Block News !", 0);

    await socialNetwork.connect(addr5).upvote(1);

    await socialNetwork.connect(addr5).post("Commentaire !", 1);

  }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});