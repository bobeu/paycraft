import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, contractAddress } from "./contractAddress";
import { waitForConfirmation } from "./waitForConfirmation";
import { Callback, AcceptOrRejectLoan } from "./readContract";

const address = contractAddress();
const acceptOrRejectLoanAbi = [
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
            "internalType": "string",
            "name": "acceptOrRejectStr",
            "type": "string"
          }
        ],
        "name": "acceptOrRejectLoanApproval",
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

export async function acceptOrRejectLoan(args: {config: Config, employerAddr: OxString, employeeId: bigint, acceptOrRejectStr: AcceptOrRejectLoan, callback: Callback, account: OxString}) {
  const { config, employeeId, employerAddr, acceptOrRejectStr, account, callback } = args;
  callback({txStatus: "Pending"});
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: acceptOrRejectLoanAbi,
    functionName: "acceptOrRejectLoanApproval",
    args: [employerAddr, employeeId, acceptOrRejectStr],
  });
  callback({txStatus: "Confirming"});
  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash, account, callback);
}