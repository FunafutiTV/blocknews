require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");
require("@nomicfoundation/hardhat-verify");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const ALCHEMY_URL = process.env.ALCHEMY_URL || ""
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || ""


module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainID: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainID: 31337
    },
    polygon: {
      url: ALCHEMY_URL,
      accounts: [POLYGON_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20"
      }
    ]
  }
};
