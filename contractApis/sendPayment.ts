import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, address } from "./contractAddress";
import { waitForConfirmation } from "./waitFortransaction";

const sendPaymentAbi = [
    {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "employeeId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "acceptSaveForMe",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "start",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stop",
            "type": "uint256"
          }
        ],
        "name": "sendPayment",
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

export async function acceptOrRejectLoan(args: {config: Config, empployeeId: bigint, acceptSaveForMe: boolean, start: bigint, stop: bigint, account: OxString}) {
  const { config, empployeeId, account, acceptSaveForMe, start, stop } = args;
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: sendPaymentAbi,
    functionName: "sendPayment",
    args: [empployeeId, acceptSaveForMe, start, stop],
  });

  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash);
}