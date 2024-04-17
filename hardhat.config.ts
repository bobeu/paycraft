import { config as dotConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotConfig();

const PRIVATE_KEY = String(process.env.PRIVATE_KEY);

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        alfajores: {
            url: "https://alfajores-forno.celo-testnet.org",
            accounts: [PRIVATE_KEY],
        },
        celo: {
            url: "https://forno.celo.org",
            accounts: [PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: {
            alfajores: String(process.env.CELOSCAN_API_KEY),
            celo: String(process.env.CELOSCAN_API_KEY),
        },
        customChains: [
            {
                network: "alfajores",
                chainId: 44787,
                urls: {
                    apiURL: "https://api-alfajores.celoscan.io/api",
                    browserURL: "https://alfajores.celoscan.io",
                },
            },
            {
                network: "celo",
                chainId: 42220,
                urls: {
                    apiURL: "https://api.celoscan.io/api",
                    browserURL: "https://celoscan.io/",
                },
            },
        ],
    },
};

export default config;