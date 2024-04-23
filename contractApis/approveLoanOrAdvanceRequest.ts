import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { AcceptOrRejectLoan, Callback, LoanOrAdvanceStr, TxType } from "./readContract";
import { preparePayment } from "./preparePayment";
import sendCUSD from "./sendCUSD";

const address = contractAddress();
const approveLoanOrAdvanceRequestAbi = [
  {
    "inputs": [
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
        "name": "acceptOrRejectStr",
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

export async function approveLoanOrAdvanceRequest(args: {config: Config, interestRate: number, employeeId: bigint, employeeAddr: OxString, txType: TxType, amortizationRate: number, acceptOrRejectStr: AcceptOrRejectLoan, callback: Callback, account: OxString, amount: bigint}) {
  const { config, interestRate, acceptOrRejectStr, callback, amortizationRate, account, amount, employeeId, txType, employeeAddr } = args;
  callback({txStatus: "Pending"});
  await preparePayment({config, account, callback, employeeId, txType});
  await sendCUSD(employeeAddr, amount);
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: approveLoanOrAdvanceRequestAbi,
    functionName: "approveLoanOrAdvanceRequest",
    args: [interestRate, amortizationRate, acceptOrRejectStr],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash, account, callback);
}