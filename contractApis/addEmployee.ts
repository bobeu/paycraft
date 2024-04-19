import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback } from "./readContract";

const address = contractAddress();
const addEmployerAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "employee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "payment",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "saveForMeRate",
        "type": "uint8"
      },
    ],
    "name": "addEmployee",
    "outputs": [
      {
        "internalType": "bool",
        "name": "done",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
] as const;

export async function addEmployee(args: {config: Config, employeeAddr: OxString, payment: bigint, saveForMeRate: number, callback: Callback, account: OxString}) {
  const { config, employeeAddr, saveForMeRate, callback, payment, account } = args;
  callback({txStatus: "Pending"});
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: addEmployerAbi,
    functionName: "addEmployee",
    args: [employeeAddr, payment, saveForMeRate],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash, account, callback);
}