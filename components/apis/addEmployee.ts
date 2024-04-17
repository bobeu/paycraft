


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