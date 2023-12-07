const hre = require("hardhat");

async function main() {

  const socialNetwork = await hre.ethers.deployContract("SocialNetwork");

  await socialNetwork.waitForDeployment();

  console.log(
    `Voting deployed to ${socialNetwork.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});