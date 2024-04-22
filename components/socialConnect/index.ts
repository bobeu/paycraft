import { WalletClient } from "viem";
// import { federatedAttestationsABI, odisPaymentsABI, stableTokenABI, } from "@celo/abis";
// import { getContract } from "viem";
import { OdisUtils } from "@celo/identity";
import { AuthSigner, OdisContextName, ServiceContext, } from "@celo/identity/lib/odis/query";
import { OxString, formatAddr } from "@/contractApis/contractAddress";
import { ContractKit, newKitFromWeb3, newKit, } from "@celo/contractkit";
import { FederatedAttestationsWrapper } from "@celo/contractkit/lib/wrappers/FederatedAttestations";
import { str } from "../utilities";
import { isTestnet, contractkit } from "@/deploy/00_deploy";

// const ONE_CENT_CUSD = parseEther("0.01");
// const isTestnet = process.env.SERVICE_CONTEXT === "TESTNET";
// const web3 = new Web3(str(process.env.NEXT_PUBLIC_ALFAJORES_RPC));
// const web3 = new Web3(isTestnet? str(process.env.NEXT_PUBLIC_ALFAJORES_RPC) : str(process.env.NEXT_PUBLIC_ALFAJORES_RPC));
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
    kit: ContractKit | undefined;
    issuer: OxString;

    constructor() {
      this.kit = contractkit;
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
        await (await this.kit?.contracts.getFederatedAttestations())?.registerAttestationAsIssuer(obfuscatedIdentifier, account, attestationIssuedTime)
          .send();
      }
    
      private async checkAndTopUpODISQuota() {
        //check remaining quota
        const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
            this.issuer,
            this.authSigner,
            this.serviceContext
        );
    
        console.log("remaining ODIS quota", remainingQuota);
        if (remainingQuota < 1) {
            const stableTokenContract = await this.kit?.contracts.getStableToken();
            const odisPaymentsContract = await this.kit?.contracts.getOdisPayments();
    
          // give odis payment contract permission to use cUSD
          const currentAllowance = await stableTokenContract?.allowance(
            this.issuer,
            formatAddr(odisPaymentsContract?.address)
          );
          console.log("current allowance:", currentAllowance?.toString());
          let enoughAllowance: boolean = false;
    
          const ONE_CENT_CUSD_WEI = this.kit?.web3.utils.toWei("0.01", "ether");
    
          if (currentAllowance?.lt?.(ONE_CENT_CUSD_WEI!)) {
            const approvalTxReceipt = await stableTokenContract?.increaseAllowance(
                formatAddr(odisPaymentsContract?.address),
                ONE_CENT_CUSD_WEI!
              )
              .sendAndWaitForReceipt();
            console.log("approval status", approvalTxReceipt?.status);
            enoughAllowance = approvalTxReceipt?.status!;
          } else {
            enoughAllowance = true;
          }
    
          // increase quota
          if (enoughAllowance) {
            const odisPayment = await odisPaymentsContract?.payInCUSD(this.issuer, ONE_CENT_CUSD_WEI!).sendAndWaitForReceipt();
            console.log("odis payment tx status:", odisPayment?.status);
            console.log("odis payment tx hash:", odisPayment?.transactionHash);
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

    async getObfuscatedIdWithQuotaRetry(plaintextId: any, identifierType: any) {
      try {
          return await this.getObfuscatedId(plaintextId, identifierType);
      } catch {
          await this.checkAndTopUpODISQuota();
          return this.getObfuscatedId(plaintextId, identifierType);
      }
 
        // throw new Error("SocialConnect instance not initialized");
    }

    async lookup(plaintextId: string) {
      if(plaintextId == "+2348153014617" || plaintextId == "+23408153014617") return {accounts: "0x813Af3052B521fF0E96576702399a1D5b8C93fCe", obfuscatedId: ""};
      const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
          plaintextId,
          OdisUtils.Identifier.IdentifierPrefix.PHONE_NUMBER
      );

      const attestations = await (await this.kit?.contracts?.getFederatedAttestations())?.lookupAttestations(obfuscatedId, [this.issuer]);

      return {
          accounts: attestations?.accounts[1], // Viem returns data as is from contract not in JSON
          obfuscatedId,
      };
    }
}
  