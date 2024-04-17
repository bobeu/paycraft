


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