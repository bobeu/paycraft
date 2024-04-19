import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback, LoanOrAdvanceStr } from "./readContract";

const address = contractAddress();
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
            "type": "uint24"
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

export async function requestAdvanceOrLoan(args: {config: Config, amount: number, employerAddr: OxString, employeeId: bigint, loanOrAdvanceStr: LoanOrAdvanceStr, callback: Callback, account: OxString}) {
  const { config, employeeId, amount, account, employerAddr, callback, loanOrAdvanceStr } = args;
  callback({txStatus: "Pending"});
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: requestAdvanceOrLoanAbi,
    functionName: "requestAdvanceOrLoan",
    args: [employerAddr, employeeId, amount, loanOrAdvanceStr],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash, account, callback);
}