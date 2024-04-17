import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, address } from "./contractAddress";
import { waitForConfirmation } from "./waitFortransaction";

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

export async function acceptOrRejectLoan(args: {config: Config, empployeeId: bigint, value: boolean, account: OxString}) {
  const { config, empployeeId, value, account } = args;
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: disableOrEnableEmployeeAbi,
    functionName: "disableOrEnableEmployee",
    args: [empployeeId, value],
  });

  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash);
}