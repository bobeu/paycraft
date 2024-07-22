import FA_CONTRACT from "./abis/FederatedAttestations.json";
import FA_PROXY_CONTRACT from "./abis/FederatedAttestationsProxy.json";
import REGISTRY_CONTRACT from "./abis/Registry.json";
import ESCROW_PROXY_CONTRACT from "./abis/EscrowProxy.json";
import ESCROW_CONTRACT from "./abis/Escrow.json";
import ODIS_PAYMENTS_CONTRACT from "./abis/OdisPayments.json";
import STABLE_TOKEN_CONTRACT from "./abis/StableToken.json";
import ACCOUNTS_CONTRACT from "./abis/Accounts.json";
import { OdisContextName } from "@celo/identity/lib/odis/query";

export const ALFAJORES_RPC = "https://alfajores-forno.celo-testnet.org";
export const ALFAJORES_ACCOUNT = "0x48522303E536B4299B57e2cC2F0f5fe85f8C316F";
export const ALFAJORES_ACCOUNT_PK =
  "726e53db4f0a79dfd63f58b19874896fce3748fcb80874665e0c147369c04a37";
export const ALFAJORES_CUSD_ADDRESS =
  "0x765DE816845861e75A25fCA122bb6898B8B1282a";

export const ISSUER_PRIVATE_KEY = process.env.NEXT_PUBLIC_ISSUER_PRIVATE_KEY;
export const DEK_PRIVATE_KEY = process.env.NEXT_PUBLIC_DEK_PRIVATE_KEY;

export const RPC =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "TESTNET"
    ? "https://alfajores-forno.celo-testnet.org"
    : "https://forno.celo.org";

export const SERVICE_CONTEXT =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "TESTNET"
    ? OdisContextName.ALFAJORES
    : OdisContextName.MAINNET;

export const FA_PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "TESTNET"
    ? "0x70F9314aF173c246669cFb0EEe79F9Cfd9C34ee3"
    : "0x0aD5b1d0C25ecF6266Dd951403723B2687d6aff2";

export const ESCROW_PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "TESTNET"
    ? "0xf4Fa51472Ca8d72AF678975D9F8795A504E7ada5"
    : "0xb07E10c5837c282209c6B9B3DE0eDBeF16319a37";

export const ODIS_PAYMENTS_PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "TESTNET"
    ? "0x645170cdB6B5c1bc80847bb728dBa56C50a20a49"
    : "0xae6b29f31b96e61dddc792f45fda4e4f0356d0cb";

export const STABLE_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "TESTNET"
    ? "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
    : "0x765DE816845861e75A25fCA122bb6898B8B1282a";

export const ACCOUNTS_PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "TESTNET"
    ? "0xed7f51A34B4e71fbE69B3091FcF879cD14bD73A9"
    : "0x7d21685C17607338b313a7174bAb6620baD0aaB7";

export const ABIS = {
    fa_abi: FA_CONTRACT.abi,
    odis_payment_abi: ODIS_PAYMENTS_CONTRACT.abi,
    stable_contract_abi: STABLE_TOKEN_CONTRACT.abi
}