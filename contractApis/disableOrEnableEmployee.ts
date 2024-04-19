import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback } from "./readContract";

const address = contractAddress();
const disableOrEnableEmployeeAbi = [
    {
        "inputs": [
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
        "name": "disableOrEnableEmployee",
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

export async function disableOrEnableEmployee(args: {config: Config, employeeId: bigint, value: boolean, callback: Callback, account: OxString}) {
  const { config, employeeId, value, account, callback } = args;
  callback({txStatus: "Pending"});
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: disableOrEnableEmployeeAbi,
    functionName: "disableOrEnableEmployee",
    args: [employeeId, value],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash, account, callback);
}