import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { config as dotconfig } from "dotenv";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";

dotconfig();
export const isTestnet = String(process.env.SERVICE_CONTEXT) === "TESTNET";
const web3 = new Web3(isTestnet? "https://alfajores-forno.celo-testnet.org" : "https://forno.celo.org");
export const contractkit = newKitFromWeb3(web3);

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
	const {deploy, getNetworkName} = deployments;
  const cUSD = (await contractkit.contracts.getStableToken()).address;
	const {deployer} = await getNamedAccounts();

  console.log(`Celo Contract ${isTestnet? "Testnet" : "Mainnet"}`, cUSD); 

  const networkName = getNetworkName();
  console.log("Network Name", networkName); 

  const loanAndSalaryAdvance = await deploy("LoanAndSalaryAdvance", {
    from: deployer,
    args: [cUSD],
    log: true,
  });
  
  console.log("LoanAndSalaryAdvance address", loanAndSalaryAdvance.address);

};

export default func;

func.tags = ["LoanAndSalaryAdvance"];






// import Web3 from "web3";
// import { newKitFromWeb3 } from "@celo/contractkit";

// const web3 = new Web3("https://alfajores-forno.celo-testnet.org");
// const kit = newKitFromWeb3(web3);


// import Web3 from "web3";
// import { newKitFromWeb3 } from "@celo/contractkit";

// // define localUrl and port with the ones for your node

// const web3 = new Web3(`${localUrl}:${port}`);
// const kit = newKitFromWeb3(web3);


// import Web3 from "web3";
// import { newKitFromWeb3 } from "@celo/contractkit";

// const web3Instance: Web3 = new Web3(
//   new Web3.providers.IpcProvider("/Users/myuser/Library/CeloNode/geth.ipc", net)
// );

// const kit = newKitFromWeb3(web3Instance);