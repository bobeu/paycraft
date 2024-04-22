import { writeContract, simulateContract, sendTransaction,  waitForTransactionReceipt, multicall } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback, retrieveEmployeePay } from "./readContract";
import { stableTokenABI } from "@celo/abis";
import { contractkit } from "@/deploy/00_deploy";
import { BigNumber } from "ethers";
import { powr } from "@/components/utilities";

const address = contractAddress();
const sendPaymentAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "employeeId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "acceptSaveForMe",
        "type": "bool"
      }
    ],
    "name": "sendPayment",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
] as const;

export async function sendPayment(args: {config: Config, acceptSaveForMe: boolean, callback: Callback, account: OxString, employeeId: bigint, employeeAddr: OxString }) {
  const { config, account, acceptSaveForMe, callback, employeeId, employeeAddr } = args;
  callback({txStatus: "Pending"});
  const cUSD = (await contractkit.contracts.getStableToken()).address;
//   const empl = await retrieveEmployeePay({config, account, employeeId, callback});
//   console.log("Empl: ", empl);
//   const { request } = await simulateContract(config, {
//     address,
//     account,
//     abi: preparePaymentAbi,
//     functionName: "preparePayment",
//     args: [employeeId],
//   });
// // callback({txStatus: "Confirming"});
//   const hash = await writeContract(config, request ); 
//   await waitForTransactionReceipt(config, {hash});

  const { request: req1 } = await simulateContract(config, {
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    account,
    abi: stableTokenABI,
    functionName: "approve",
    args: [address, powr(1, 1, 18).toBigInt()],
  });
  // callback({txStatus: "Confirming"});
  const hash1 = await writeContract(config, req1 ); 
  await waitForTransactionReceipt(config, {hash: hash1});

  const { request : req2 } = await simulateContract(config, {
    address,
    account,
    abi: sendPaymentAbi,
    functionName: "sendPayment",
    args: [employeeId, acceptSaveForMe],
  });
  callback({txStatus: "Confirming"});
  const hash2 = await writeContract(config, req2 ); 
  return await waitForConfirmation(config, hash2, account, callback);
// await waitForTransactionReceipt(config, {hash: hash1});

  
}








// await multicall(config, {
//   contracts: [
//     {
//       abi: preparePaymentAbi,
//       functionName: "preparePayment",
//       address,
//       args: [employeeId]
//     },
//     {
//       abi: stableTokenABI,
//       functionName: "transfer",
//       address: cUSD,
//       args: [employeeAddr, empl[0]]
//     },
//     {
//       address,
//       abi: sendPaymentAbi,
//       functionName: "sendPayment",
//       args: [acceptSaveForMe],
//     },
//   ]
// })