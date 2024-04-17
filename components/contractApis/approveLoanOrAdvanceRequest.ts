import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, address } from "./contractAddress";
import { waitForConfirmation } from "./waitFortransaction";

const approveLoanOrAdvanceRequestAbi = [
    {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "employeeId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "interestRate",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "amortizationRate",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "loanOrAdvanceStr",
            "type": "string"
          }
        ],
        "name": "approveLoanOrAdvanceRequest",
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

export async function acceptOrRejectLoan(args: {config: Config, empployeeId: bigint, interestRate: number, amortizationRate: number, loanOrAdvanceStr:  string, account: OxString}) {
  const { config, interestRate, loanOrAdvanceStr, empployeeId, amortizationRate, account } = args;
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: approveLoanOrAdvanceRequestAbi,
    functionName: "approveLoanOrAdvanceRequest",
    args: [empployeeId, interestRate, amortizationRate, loanOrAdvanceStr],
  });

  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash);
}