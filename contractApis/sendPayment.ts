import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback } from "./readContract";

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

export async function sendPayment(args: {config: Config, employeeId: bigint, acceptSaveForMe: boolean, callback: Callback, account: OxString}) {
  const { config, employeeId, account, acceptSaveForMe, callback } = args;
  callback({txStatus: "Pending"});
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: sendPaymentAbi,
    functionName: "sendPayment",
    args: [employeeId, acceptSaveForMe],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash,account, callback);
}