import { writeContract, simulateContract } from "wagmi/actions";
import { Config } from "wagmi";
import { OxString, address } from "./contractAddress";
import { waitForConfirmation } from "./waitFortransaction";

const addEmployerAbi = [
    {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "addresses",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "payments",
            "type": "uint256[]"
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
          }
        ],
        "name": "addEmployee",
        "outputs": [
          {
            "internalType": "bool",
            "name": "done",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
] as const;

export async function acceptOrRejectLoan(args: {config: Config, empployeeAddrs: OxString[], payments: bigint[], saveForMeRate: number, amortizationRate: number, account: OxString}) {
  const { config, empployeeAddrs, saveForMeRate, amortizationRate, payments, account } = args;
  const { request } = await simulateContract(config, {
    address,
    account,
    abi: addEmployerAbi,
    functionName: "addEmployee",
    args: [empployeeAddrs, payments, saveForMeRate, amortizationRate],
  });

  const hash = await writeContract(config, request ); 
  return await waitForConfirmation(config, hash);
}