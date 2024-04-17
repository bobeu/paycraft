import { OxString, WagmiConfig, address } from "./contractAddress";
import { readContract } from "wagmi/actions";

export enum AdvanceRequestStatus {NONE, PENDING, DISBURSED, SERVICED}
export enum LoanRequestStatus {NONE, REQUESTED, RESPONDED, ACCEPTED, SERVICED}
export type EmployeePayloads = Readonly<EmployeePayload[]>;

export interface AdvanceRequest {
    amount: bigint;
    amortizationAmt: bigint;
    status: AdvanceRequestStatus;
}

export interface LoanRequest {
    amount: bigint;
    interest: bigint;
    amortizationAmt: bigint;
    status: LoanRequestStatus;
}

export interface EmployeePayload {
    identifier: OxString;
    workId: bigint;
    active: boolean;
    saveForMe: boolean;
    pay: bigint;
    saveForMeRate: number;
    amortizationRate: number;
    advanceReq: AdvanceRequest;
    loanReq: LoanRequest;
}

export const getEmployeeAbi = [
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "employerAddr",
            "type": "address"
          }
        ],
        "name": "getEmployees",
        "outputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "identifier",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "workId",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "saveForMe",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "pay",
                "type": "uint256"
              },
              {
                "internalType": "uint8",
                "name": "saveForMeRate",
                "type": "uint8"
              },
              {
                "internalType": "uint8",
                "name": "amortizationRate",
                "type": "uint8"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "amortizationAmt",
                    "type": "uint256"
                  },
                  {
                    "internalType": "enum ILoanAndSalaryAdvance.AdvanceRequestStatus",
                    "name": "status",
                    "type": "uint8"
                  }
                ],
                "internalType": "struct ILoanAndSalaryAdvance.AdvanceRequest",
                "name": "advanceReq",
                "type": "tuple"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "interest",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "amortizationAmt",
                    "type": "uint256"
                  },
                  {
                    "internalType": "enum ILoanAndSalaryAdvance.LoanRequestStatus",
                    "name": "status",
                    "type": "uint8"
                  }
                ],
                "internalType": "struct ILoanAndSalaryAdvance.LoanRequest",
                "name": "loanReq",
                "type": "tuple"
              }
            ],
            "internalType": "struct ILoanAndSalaryAdvance.EmployeePayload[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    },
] as const;

export const getEmployees = async(args: {config: WagmiConfig, account: OxString}) : Promise<EmployeePayloads> => {
    const { config, account } = args;
    const result = await readContract(config, {
        abi: getEmployeeAbi,
        functionName: "getEmployees",
        account,
        args: [account],
        address
    });
    return result;
}