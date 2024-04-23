import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback, type TxType} from "./readContract";

const address = contractAddress();
const preparePaymentRequestAbi = [
    {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "employeeId",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "txType",
            "type": "uint8"
          }
        ],
        "name": "preparePaymentRequest",
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


export async function preparePayment(args: {config: Config, employeeId: bigint, callback: Callback, account: OxString, txType: TxType}) {
    const { config, employeeId, account, callback, txType } = args;
    callback({txStatus: "Pending"});
    const { request } = await simulateContract(config, {
      address,
      account,
      abi: preparePaymentRequestAbi,
      functionName: "preparePaymentRequest",
      args: [employeeId, txType],
    });
    callback({txStatus: "Confirming"});
    const hash = await writeContract(config, request ); 
    return await waitForConfirmation(config, hash, account, callback);
  }

