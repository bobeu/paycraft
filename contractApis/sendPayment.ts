import { writeContract, simulateContract, sendTransaction,  waitForTransactionReceipt } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback, retrieveEmployeePay } from "./readContract";

const address = contractAddress();
const sendPaymentAbi = [
  {
    "inputs": [
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

const preparePaymentAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "employeeId",
        "type": "uint256"
      }
    ],
    "name": "preparePayment",
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
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: preparePaymentAbi,
    functionName: "preparePayment",
    args: [employeeId],
  });
  // callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  await waitForTransactionReceipt(config, {hash});
  const empl = await retrieveEmployeePay({config, account, employeeId, callback});
  console.log("Empl: ", empl);
  
  await sendTransaction(config, {
    to: employeeAddr,
    account,
    value: empl[0],
  });

  const { request : req1 } = await simulateContract(config, {
    address,
    account,
    abi: sendPaymentAbi,
    functionName: "sendPayment",
    args: [acceptSaveForMe],
  });
  callback({txStatus: "Confirming"});
  const hash1 = await writeContract(config, req1 ); 
  return await waitForConfirmation(config, hash1, account, callback);
  // await waitForTransactionReceipt(config, {hash: hash1});

}