import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, address } from "./contractAddress";
import { waitForConfirmation } from "./waitFortransaction";

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

export async function acceptOrRejectLoan(args: {config: Config, employerAddr: OxString, empployeeId: bigint, value: boolean, account: OxString}) {
  const { config, empployeeId, account, employerAddr, value } = args;
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: save4MeAbi,
    functionName: "save4Me",
    args: [employerAddr, empployeeId, value],
  });

  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash);
}