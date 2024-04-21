import { WalletClient } from "viem";
// import { federatedAttestationsABI, odisPaymentsABI, stableTokenABI, } from "@celo/abis";
// import { getContract } from "viem";
import { OdisUtils } from "@celo/identity";
import { AuthSigner, OdisContextName, ServiceContext, } from "@celo/identity/lib/odis/query";
import { OxString, formatAddr } from "@/contractApis/contractAddress";
import { ContractKit, newKitFromWeb3, newKit, } from "@celo/contractkit";
import { FederatedAttestationsWrapper } from "@celo/contractkit/lib/wrappers/FederatedAttestations";
import { str } from "../utilities";
import Web3 from "web3";

// const ONE_CENT_CUSD = parseEther("0.01");
const isTestnet = process.env.SERVICE_CONTEXT === "TESTNET";
const web3 = new Web3(isTestnet? str(process.env.NEXT_PUBLIC_ALFAJORES_RPC) : str(process.env.NEXT_PUBLIC_ALFAJORES_RPC));
const SERVICE_CONTEXT = isTestnet? OdisContextName.ALFAJORES : OdisContextName.MAINNET;
const ISSUER = isTestnet? process.env.NEXT_PUBLIC_MINIPAY_ISSUER_TESTNET : process.env.NEXT_PUBLIC_MINIPAY_ISSUER_MAINNET;

export class SocialConnect {
    authSigner: AuthSigner;
    federatedAttestationsContractAddress: OxString | undefined;
    federatedAttestationsContract: FederatedAttestationsWrapper | undefined;
    odisPaymentsContractAddress: OxString | undefined;
    odisPaymentsContract: any | undefined;
    stableTokenContractAddress: OxString | undefined;
    stableTokenContract: any | undefined;
    serviceContext: ServiceContext;
    kit: ContractKit;
    issuer: OxString;
    initialized = false;

    constructor() {
      this.kit = newKitFromWeb3(web3);
      // this.kit = newKit(isTestnet? str(process.env.NEXT_PUBLIC_ALFAJORES_RPC) : str(process.env.NEXT_PUBLIC_ALFAJORES_RPC),);
      this.authSigner = {
        authenticationMethod: OdisUtils.Query.AuthenticationMethod.ENCRYPTION_KEY,
        rawKey: str(process.env.DEK_PRIVATE_KEY)
      };
      this.serviceContext = OdisUtils.Query.getServiceContext(SERVICE_CONTEXT);
      this.issuer = formatAddr(ISSUER);
    }

    async registerAttestation(phoneNumber: string, account: string, attestationIssuedTime: number) {
        await this.checkAndTopUpODISQuota();
        // get identifier from phone number using ODIS
        const {obfuscatedIdentifier} = await OdisUtils.Identifier.getObfuscatedIdentifier(
            phoneNumber,
            OdisUtils.Identifier.IdentifierPrefix.PHONE_NUMBER,
            this.issuer,
            this.authSigner,
            this.serviceContext
        )
    
        // upload identifier <-> address mapping to onchain registry
        await (await this.kit.contracts.getFederatedAttestations())
          .registerAttestationAsIssuer(obfuscatedIdentifier, account, attestationIssuedTime)
          .send();
      }
    
      // async lookupAddresses(phoneNumber: string) {
      //   // get identifier from phone number using ODIS
      //   const {obfuscatedIdentifier} = await OdisUtils.Identifier.getObfuscatedIdentifier(
      //       phoneNumber,
      //       OdisUtils.Identifier.IdentifierPrefix.PHONE_NUMBER,
      //       this.issuer,
      //       this.authSigner,
      //       this.serviceContext
      //   )
    
      //   const federatedAttestationsContract =
      //     await this.kit.contracts.getFederatedAttestations();
    
      //   // query on-chain mappings
      //   const attestations = await federatedAttestationsContract.lookupAttestations(
      //     obfuscatedIdentifier,
      //     [str(this.issuer)]
      //   );
    
      //   return attestations.accounts;
      // }
    
      private async checkAndTopUpODISQuota() {
        //check remaining quota
        const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
            this.issuer,
            this.authSigner,
            this.serviceContext
        );
    
        console.log("remaining ODIS quota", remainingQuota);
        if (remainingQuota < 1) {
            const stableTokenContract = await this.kit.contracts.getStableToken();
            const odisPaymentsContract = await this.kit.contracts.getOdisPayments();
    
          // give odis payment contract permission to use cUSD
          const currentAllowance = await stableTokenContract.allowance(
            this.issuer,
            odisPaymentsContract.address
          );
          console.log("current allowance:", currentAllowance.toString());
          let enoughAllowance: boolean = false;
    
          const ONE_CENT_CUSD_WEI = this.kit.web3.utils.toWei("0.01", "ether");
    
          if (currentAllowance.lt(ONE_CENT_CUSD_WEI)) {
            const approvalTxReceipt = await stableTokenContract
              .increaseAllowance(
                odisPaymentsContract.address,
                ONE_CENT_CUSD_WEI
              )
              .sendAndWaitForReceipt();
            console.log("approval status", approvalTxReceipt.status);
            enoughAllowance = approvalTxReceipt.status;
          } else {
            enoughAllowance = true;
          }
    
          // increase quota
          if (enoughAllowance) {
            const odisPayment = await odisPaymentsContract
              .payInCUSD(this.issuer, ONE_CENT_CUSD_WEI)
              .sendAndWaitForReceipt();
            console.log("odis payment tx status:", odisPayment.status);
            console.log("odis payment tx hash:", odisPayment.transactionHash);
          } else {
            throw "cUSD approval failed";
          }
        }
    }

    async getObfuscatedId(plaintextId: any, identifierType: any) {
        // TODO look into client side blinding
        const { obfuscatedIdentifier } =
            await OdisUtils.Identifier.getObfuscatedIdentifier(
                plaintextId,
                identifierType,
                this.issuer,
                this.authSigner,
                this.serviceContext
            );
        return obfuscatedIdentifier;
    }

    // async #checkAndTopUpODISQuota() {
    //     const remainingQuota = await this.checkODISQuota();

    //     if (remainingQuota < 1) {
    //         // TODO make threshold a constant
    //         let approvalTxHash =
    //             await this.stableTokenContract.write.increaseAllowance([
    //                 this.odisPaymentsContractAddress,
    //                 ONE_CENT_CUSD, // TODO we should increase by more
    //             ]);

    //         let approvalTxReceipt =
    //             await publicClient.waitForTransactionReceipt({
    //                 hash: approvalTxHash,
    //             });

    //         let odisPaymentTxHash =
    //             await this.odisPaymentsContract.write.payInCUSD([
    //                 this.walletClient.account,
    //                 ONE_CENT_CUSD, // TODO we should increase by more
    //             ]);

    //         let odisPaymentReceipt =
    //             await publicClient.waitForTransactionReceipt({
    //                 hash: odisPaymentTxHash,
    //             });
    //     }
    // }

    async getObfuscatedIdWithQuotaRetry(plaintextId: any, identifierType: any) {
      try {
          return await this.getObfuscatedId(plaintextId, identifierType);
      } catch {
          await this.checkAndTopUpODISQuota();
          return this.getObfuscatedId(plaintextId, identifierType);
      }
 
        // throw new Error("SocialConnect instance not initialized");
    }

    // async registerOnChainIdentifier(plaintextId: any, identifierType: any, address: any) {
    //     if (this.initialized) {
    //         const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
    //             plaintextId,
    //             identifierType
    //         );

    //         const hash =
    //             await this.federatedAttestationsContract.write.registerAttestationAsIssuer(
    //                 [
    //                     // TODO check if there are better code patterns for sending txs
    //                     obfuscatedId,
    //                     address,
    //                     NOW_TIMESTAMP,
    //                 ]
    //             );

    //         const receipt = await publicClient.waitForTransactionReceipt({
    //             hash,
    //         });

    //         return receipt;
    //     }
    //     throw new Error("SocialConnect instance not initialized");
    // }

    // async deregisterOnChainIdentifier(plaintextId: any, identifierType: any, address: any) {
    //     if (this.initialized) {
    //         const obfuscatedId = await this.getObfuscatedId(
    //             plaintextId,
    //             identifierType
    //         );
    //         const hash =
    //             await this.federatedAttestationsContract.write.revokeAttestation(
    //                 [obfuscatedId, this.walletClient.account.address, address]
    //             );

    //         const receipt = await publicClient.waitForTransactionReceipt({
    //             hash,
    //         });

    //         return receipt;
    //     }
    //     throw new Error("SocialConnect instance not initialized");
    // }

    // async checkODISQuota() {
    //     if (this.initialized) {
    //         const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
    //             this.walletClient.account.address,
    //             this.authSigner,
    //             this.serviceContext
    //         );
    //         console.log("Remaining Quota", remainingQuota);
    //         return remainingQuota;
    //     }
    //     throw new Error("SocialConnect instance not initialized");
    // }

    async lookup(plaintextId: string) {
        if (this.initialized) {
            const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
                plaintextId,
                OdisUtils.Identifier.IdentifierPrefix.PHONE_NUMBER
            );

            const attestations = await (await this.kit.contracts.getFederatedAttestations()).lookupAttestations(obfuscatedId, [this.issuer]);

            return {
                accounts: attestations.accounts[1], // Viem returns data as is from contract not in JSON
                obfuscatedId,
            };
        }
        throw new Error("SocialConnect instance not initialized");
    }
}
  
















// async initialize() {
//     this.federatedAttestationsContractAddress =
//         await getCoreContractAddress("FederatedAttestations");

//     this.federatedAttestationsContract = getContract({
//         address: this.federatedAttestationsContractAddress,
//         abi: federatedAttestationsABI,

//         // Needed for lookup
//         publicClient,

//         // Needed for registeration and de-registration
//         walletClient: this.walletClient,
//     });

//     this.odisPaymentsContractAddress = await getCoreContractAddress(
//         "OdisPayments"
//     );
//     this.odisPaymentsContract = getContract({
//         address: this.odisPaymentsContractAddress,
//         abi: odisPaymentsABI,
//         walletClient: this.walletClient,
//     });

//     this.stableTokenContractAddress = await getCoreContractAddress(
//         "StableToken"
//     );
//     this.stableTokenContract = getContract({
//         address: this.stableTokenContractAddress,
//         abi: stableTokenABI,
//         walletClient: this.walletClient,
//     });

//     this.initialized = true;
// }




















// const getObfuscatedIdentifier = async() => {
//     await OdisUtils.Identifier.getObfuscatedIdentifier(
//         '+12345678910',
//         OdisUtils.Identifier.IdentifierPrefix.PHONE_NUMBER,
//         issuerAddress,
//         authSigner,
//         serviceContext
//       )

// }



// const { createPublicClient, http } = require("viem");
// const { celo } = require("viem/chains");
// const { privateKeyToAccount } = require("viem/accounts");
// const { SocialConnectIssuer } = require("./SocialConnect.js");

// let account = privateKeyToAccount(process.env.ISSUER_PRIVATE_KEY);

// let walletClient = createWalletClient({
//   account,
//   transport: http(),
//   chain,
// });

// const issuer = new SocialConnectIssuer(walletClient, {
//   authenticationMethod: AuthenticationMethod.ENCRYPTION_KEY,
//   rawKey: process.env.DEK_PRIVATE_KEY,
// });

// await issuer.initialize();

// const identifierType = IdentifierPrefix.PHONE_NUMBER;

// /**
//  * Any phone number you want to lookup
//  *
//  * The below phone number is registered on the testnet issuer mentioned below.
//  */
// const identifier = "+911234567890";

// /**
//  * You can lookup under multiple issuers in one request.
//  *
//  * Below is the MiniPay issuer address on Mainnet.
//  *
//  * Note: Remember to make your environment variable ENVIRONMENT=MAINNET
//  */
// let issuerAddresses = ["0x7888612486844Bb9BE598668081c59A9f7367FBc"];

// // A testnet issuer we setup for you to lookup on testnet.
// // let issuerAddresses = ["0xDF7d8B197EB130cF68809730b0D41999A830c4d7"];

// let results = await issuer.lookup(identifier, identifierType, issuerAddresses);








// You will need to use the web-compatible version version of blind-threshold-bls. To do so, add this to your package.json, making sure that you're referencing the right commit:

// "dependencies": {
//     "blind-threshold-bls": "https://github.com/celo-org/blind-threshold-bls-wasm#3d1013af"
//   }
// Copy blind_threshold_bls_bg.wasm into the /public folder of your web project, so that it's accessible via an absolute path. Ensure that its location matches the path specified in the init function in the WebBlsBlindingClient that is used.

// import { WebBlsBlindingClient } from './blinding/webBlindingClient'

// const blindingClient = new WebBlsBlindingClient(
//   serviceContext.odisPubKey
// )
// await blindingClient.init()

// const { obfuscatedIdentifier } = await OdisUtils.Identifier.getObfuscatedIdentifier(
//   phoneNumber,
//   OdisUtils.Identifier.IdentifierPrefix.PHONE_NUMBER,
//   issuerAddress,
//   authSigner,
//   serviceContext,
//   undefined,
//   undefined,
//   blindingClient
// )













// import { Abi, parseEther } from "viem";
// import { federatedAttestationsABI, odisPaymentsABI, stableTokenABI } from "@celo/abis";
// import { getContract } from "viem";
// import { OdisUtils } from "@celo/identity";
// import { OdisContextName } from "@celo/identity/lib/odis/query";

// const ONE_CENT_CUSD = parseEther("0.01");

// const SERVICE_CONTEXT =
// process.env.ENVIRONMENT === "TESTNET"
// ? OdisContextName.ALFAJORES
// : OdisContextName.MAINNET;
  
// export class SocialConnectIssuer {
//     walletClient;
//     authSigner;

//     federatedAttestationsContractAddress: any;
//     federatedAttestationsContract: { address: `0x${string}`; abi: Abi | readonly unknown[]; };

//     odisPaymentsContractAddress: any;
//     odisPaymentsContract: { address: `0x${string}`; abi: Abi | readonly unknown[]; };

//     stableTokenContractAddress: any;
//     stableTokenContract: { address: `0x${string}`; abi: Abi | readonly unknown[]; };

//     serviceContext;
//     initialized = false;

//     constructor(walletClient: any, authSigner: any) {
//         this.walletClient = walletClient;
//         this.authSigner = authSigner;
//         this.serviceContext = OdisUtils.Query.getServiceContext(SERVICE_CONTEXT);
//     }

//     async initialize() {
//         this.federatedAttestationsContractAddress =
//             await getCoreContractAddress("FederatedAttestations");

//         this.federatedAttestationsContract = getContract({
//             address: this.federatedAttestationsContractAddress,
//             abi: federatedAttestationsABI,

//             // Needed for lookup
//             publicClient,

//             // Needed for registeration and de-registration
//             walletClient: this.walletClient,
//         });

//         this.odisPaymentsContractAddress = await getCoreContractAddress(
//             "OdisPayments"
//         );
//         this.odisPaymentsContract = getContract({
//             address: this.odisPaymentsContractAddress,
//             abi: odisPaymentsABI,
//             walletClient: this.walletClient,
//         });

//         this.stableTokenContractAddress = await getCoreContractAddress(
//             "StableToken"
//         );
//         this.stableTokenContract = getContract({
//             address: this.stableTokenContractAddress,
//             abi: stableTokenABI,
//             walletClient: this.walletClient,
//         });

//         this.initialized = true;
//     }

//     async #getObfuscatedId(plaintextId: any, identifierType: any) {
//         // TODO look into client side blinding
//         const { obfuscatedIdentifier } =
//             await OdisUtils.Identifier.getObfuscatedIdentifier(
//                 plaintextId,
//                 identifierType,
//                 this.walletClient.account.address,
//                 this.authSigner,
//                 this.serviceContext
//             );
//         return obfuscatedIdentifier;
//     }

//     async #checkAndTopUpODISQuota() {
//         const remainingQuota = await this.checkODISQuota();

//         if (remainingQuota < 1) {
//             // TODO make threshold a constant
//             let approvalTxHash =
//                 await this.stableTokenContract.write.increaseAllowance([
//                     this.odisPaymentsContractAddress,
//                     ONE_CENT_CUSD, // TODO we should increase by more
//                 ]);

//             let approvalTxReceipt =
//                 await publicClient.waitForTransactionReceipt({
//                     hash: approvalTxHash,
//                 });

//             let odisPaymentTxHash =
//                 await this.odisPaymentsContract.write.payInCUSD([
//                     this.walletClient.account,
//                     ONE_CENT_CUSD, // TODO we should increase by more
//                 ]);

//             let odisPaymentReceipt =
//                 await publicClient.waitForTransactionReceipt({
//                     hash: odisPaymentTxHash,
//                 });
//         }
//     }

//     async getObfuscatedIdWithQuotaRetry(plaintextId: any, identifierType: any) {
//         if (this.initialized) {
//             try {
//                 return await this.#getObfuscatedId(plaintextId, identifierType);
//             } catch {
//                 await this.#checkAndTopUpODISQuota();
//                 return this.#getObfuscatedId(plaintextId, identifierType);
//             }
//         }
//         throw new Error("SocialConnect instance not initialized");
//     }

//     async registerOnChainIdentifier(plaintextId: any, identifierType: any, address: any) {
//         if (this.initialized) {
//             const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
//                 plaintextId,
//                 identifierType
//             );

//             const hash =
//                 await this.federatedAttestationsContract.write.registerAttestationAsIssuer(
//                     [
//                         // TODO check if there are better code patterns for sending txs
//                         obfuscatedId,
//                         address,
//                         NOW_TIMESTAMP,
//                     ]
//                 );

//             const receipt = await publicClient.waitForTransactionReceipt({
//                 hash,
//             });

//             return receipt;
//         }
//         throw new Error("SocialConnect instance not initialized");
//     }

//     async deregisterOnChainIdentifier(plaintextId: any, identifierType: any, address: any) {
//         if (this.initialized) {
//             const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
//                 plaintextId,
//                 identifierType
//             );
//             const hash =
//                 await this.federatedAttestationsContract.write.revokeAttestation(
//                     [obfuscatedId, this.walletClient.account.address, address]
//                 );

//             const receipt = await publicClient.waitForTransactionReceipt({
//                 hash,
//             });

//             return receipt;
//         }
//         throw new Error("SocialConnect instance not initialized");
//     }

//     async checkODISQuota() {
//         if (this.initialized) {
//             const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
//                 this.walletClient.account.address,
//                 this.authSigner,
//                 this.serviceContext
//             );
//             console.log("Remaining Quota", remainingQuota);
//             return remainingQuota;
//         }
//         throw new Error("SocialConnect instance not initialized");
//     }

//     async lookup(plaintextId: any, identifierType: any, issuerAddresses: any) {
//         if (this.initialized) {
//             const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
//                 plaintextId,
//                 identifierType
//             );

//             const attestations =
//                 await this.federatedAttestationsContract.read.lookupAttestations(
//                     [obfuscatedId, issuerAddresses]
//                 );

//             return {
//                 accounts: attestations[1], // Viem returns data as is from contract not in JSON
//                 obfuscatedId,
//             };
//         }
//         throw new Error("SocialConnect instance not initialized");
//     }
// }
  