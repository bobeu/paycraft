import { OxString, WagmiConfig, contractAddress } from "./contractAddress";
import { readContract } from "wagmi/actions";

const address = contractAddress();
export const LoanStatus = ["NONE", "REQUESTED", "RESPONDED", "ACCEPTED", "SERVICED"];
export const AdvanceStatus = ["NONE", "PENDING", "DISBURSED", "SERVICED"];
export type AcceptOrRejectLoan = "ACCEPTED" | "REJECTED";
export type LoanOrAdvanceStr = "LOAN" | "ADVANCE";
export enum AdvanceRequestStatus {NONE, PENDING, DISBURSED, SERVICED}
export enum LoanRequestStatus {NONE, REQUESTED, RESPONDED, ACCEPTED, SERVICED}
export type EmployeePayloads = Readonly<EmployeePayload[]>;
export type Status = "Pending" | "Confirming" | "Confirmed";
export enum TxType {NONE, LOAN, SALARYPAY};

export type Callback = (args: {txStatus?: Status, result?: EmployeePayloads}) => void;
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

export type EmployeePayReturnType = Readonly<[bigint, bigint, boolean, boolean]>

export interface EmployeePayload {
    identifier: OxString;
    employer: OxString;
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
    "inputs": [],
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
            "internalType": "address",
            "name": "employer",
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
        "name": "_returnData",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
] as const;

const employeePayAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "employeeId",
        "type": "uint256"
      }
    ],
    "name": "retrievEmployeePayment",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "payBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "loanBal",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isLoan",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isAdvance",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
] as const

export const getEmployees = async(args: {config: WagmiConfig, account: OxString, callback: Callback}) => {
    const { config, account, callback } = args;
    const result = await readContract(config, {
        abi: getEmployeeAbi,
        functionName: "getEmployees",
        account,
        args: [],
        address
    });
    callback({result});
}

export const retrieveEmployeePay = async(args: {config: WagmiConfig, account: OxString, employeeId: bigint, callback: Callback}) => {
    const { config, account, callback, employeeId } = args;
    const result :EmployeePayReturnType = await readContract(config, {
        abi: employeePayAbi,
        functionName: "retrievEmployeePayment",
        account,
        args: [employeeId],
        address
    });
    return result;
    // callback({employeePaymentReturn: result});
}