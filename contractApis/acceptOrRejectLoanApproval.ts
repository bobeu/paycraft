import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, address } from "./contractAddress";
import { waitForConfirmation } from "./waitFortransaction";

const acceptOrRejectLoanAbi = [
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
            "internalType": "string",
            "name": "acceptOrRejectStr",
            "type": "string"
          }
        ],
        "name": "acceptOrRejectLoanApproval",
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

export async function acceptOrRejectLoan(args: {config: Config, empployerAddr: OxString, employerId: bigint, acceptOrRejectStr: string, account: OxString}) {
  const { config, employerId, empployerAddr, acceptOrRejectStr, account } = args;
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: acceptOrRejectLoanAbi,
    functionName: "acceptOrRejectLoanApproval",
    args: [empployerAddr, employerId, acceptOrRejectStr],
  });

  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash);
}