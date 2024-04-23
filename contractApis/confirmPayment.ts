import { writeContract, simulateContract, sendTransaction,  waitForTransactionReceipt, multicall, readContract } from "wagmi/actions";
import { OxString, WagmiConfig, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback, retrieveEmployeePay, TxType } from "./readContract";
import { stableTokenABI } from "@celo/abis";
import { contractkit } from "@/deploy/00_deploy";
import { BigNumber } from "ethers";
import { powr } from "@/components/utilities";
import sendCUSD from "./sendCUSD";
import { preparePayment } from "./preparePayment";

const address = contractAddress();
const confirmPaymentAbi = [
  {
    "inputs": [],
    "name": "confirmPayment",
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

export async function confirmPayment(args: {config: WagmiConfig, amount: bigint, acceptSaveForMe: boolean, callback: Callback, account: OxString, employeeId: bigint, employeeAddr: OxString}) {
  const { config, account, amount, callback, employeeId, employeeAddr } = args;
  // const alc = "0x813Af3052B521fF0E96576702399a1D5b8C93fCe"
  await preparePayment({config, account, callback, employeeId, txType: TxType.SALARYPAY })
  await sendCUSD(employeeAddr, amount);
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: confirmPaymentAbi,
    functionName: "confirmPayment",
    args: [],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash, account, callback);
  
}
