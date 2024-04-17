import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, address } from "./contractAddress";
import { waitForConfirmation } from "./waitFortransaction";

const requestAdvanceOrLoanAbi = [
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
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "loanOrAdvanceStr",
            "type": "string"
          }
        ],
        "name": "requestAdvanceOrLoan",
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

export async function acceptOrRejectLoan(args: {config: Config, amount: bigint, employerAddr: OxString, empployeeId: bigint, loanOrAdvanceStr: string, account: OxString}) {
  const { config, empployeeId, amount, account, employerAddr, loanOrAdvanceStr } = args;
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: requestAdvanceOrLoanAbi,
    functionName: "requestAdvanceOrLoan",
    args: [employerAddr, empployeeId, amount, loanOrAdvanceStr],
  });

  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash);
}