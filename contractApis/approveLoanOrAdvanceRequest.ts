import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback, LoanOrAdvanceStr } from "./readContract";

const address = contractAddress();
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

export async function approveLoanOrAdvanceRequest(args: {config: Config, employeeId: bigint, interestRate: number, amortizationRate: number, loanOrAdvanceStr: LoanOrAdvanceStr, callback: Callback, account: OxString}) {
  const { config, interestRate, loanOrAdvanceStr, employeeId, callback, amortizationRate, account } = args;
  callback({txStatus: "Pending"});
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: approveLoanOrAdvanceRequestAbi,
    functionName: "approveLoanOrAdvanceRequest",
    args: [employeeId, interestRate, amortizationRate, loanOrAdvanceStr],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash, account, callback);
}