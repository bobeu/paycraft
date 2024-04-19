import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback } from "./readContract";

const address = contractAddress();
const save4MeAbi = [
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "employerAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "employeeId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "value",
            "type": "bool"
          }
        ],
        "name": "save4Me",
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

export async function save4Me(args: {config: Config, employerAddr: OxString, employeId: bigint, value: boolean, callback: Callback, account: OxString}) {
  const { config, employeId, account, employerAddr, value, callback } = args;
  callback({txStatus: "Pending"});
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: save4MeAbi,
    functionName: "save4Me",
    args: [employerAddr, employeId, value],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash, account, callback);
}