import { Contract, Wallet, ethers } from "ethers";
import { AuthSigner, ServiceContext } from "@celo/identity/lib/odis/query";
import { OdisUtils } from "@celo/identity";
import { IdentifierPrefix } from "@celo/identity/lib/odis/identifier";
import {
    ABIS,
    FA_PROXY_ADDRESS,
    ODIS_PAYMENTS_PROXY_ADDRESS,
    SERVICE_CONTEXT,
    STABLE_TOKEN_ADDRESS,
} from "./constants";

const { fa_abi, odis_payment_abi, stable_contract_abi } = ABIS;
export const ONE_CENT_CUSD = ethers.utils.parseEther("0.01");

export const NOW_TIMESTAMP = Math.floor(new Date().getTime() / 1000);

export class SocialConnectIssuer {
  private readonly federatedAttestationsContract: Contract;
  private readonly odisPaymentsContract: Contract;
  private readonly stableTokenContract: Contract;
  readonly serviceContext: ServiceContext;

  constructor(
    private readonly wallet: Wallet,
    private readonly authSigner: AuthSigner
  ) {
    this.serviceContext = OdisUtils.Query.getServiceContext(SERVICE_CONTEXT);
    this.federatedAttestationsContract = new Contract(
      FA_PROXY_ADDRESS,
      fa_abi,
      this.wallet
    );
    this.odisPaymentsContract = new Contract(
      ODIS_PAYMENTS_PROXY_ADDRESS,
      odis_payment_abi,
      this.wallet
    );
    this.stableTokenContract = new Contract(
      STABLE_TOKEN_ADDRESS,
      stable_contract_abi,
      this.wallet
    );
  }

  async getObfuscatedId(plaintextId: string, identifierType: IdentifierPrefix) {
    // TODO look into client side blinding
    const { obfuscatedIdentifier } =
      await OdisUtils.Identifier.getObfuscatedIdentifier(
        plaintextId,
        identifierType,
        this.wallet.address,
        this.authSigner,
        this.serviceContext
      );
    return obfuscatedIdentifier;
  }

  /**
   * We examine the balances of this.wallet in stableTokenContract.
   * if the balance is falls below expected threshold, we simply:
   *    - Increase the amount the amount of cUSD odisPaymentsContract can spend on our behalf.
   *    - Thereafter, we asked the odisPaymentsContract to go ahead and spend the amount we just approved.
   *        Note: In this context, odisPaymentsContract relies on us to execute the transferFrom action. 
   */
  async checkAndTopUpODISQuota() {
    const remainingQuota = await this.checkODISQuota();

    if (remainingQuota < 1) {
      // TODO make threshold a constant
      const approvalTxReceipt = (
        await this.stableTokenContract.increaseAllowance(
          this.odisPaymentsContract.address,
          ONE_CENT_CUSD // TODO we should increase by more
        )
      ).wait();

      console.log(approvalTxReceipt);

      const odisPaymentTxReceipt = (
        await this.odisPaymentsContract.payInCUSD(
          this.wallet.address,
          ONE_CENT_CUSD // TODO we should increase by more
        )
      ).wait();

      console.log(odisPaymentTxReceipt);
    }
  }

  async getObfuscatedIdWithQuotaRetry(
    plaintextId: string,
    identifierType: IdentifierPrefix
  ) {
    try {
      return await this.getObfuscatedId(plaintextId, identifierType);
    } catch {
      await this.checkAndTopUpODISQuota();
      return this.getObfuscatedId(plaintextId, identifierType);
    }
  }

  async registerOnChainIdentifier(
    plaintextId: string,
    identifierType: IdentifierPrefix,
    address: string
  ) {
    const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
      plaintextId,
      identifierType
    );

    const tx =
      await this.federatedAttestationsContract.registerAttestationAsIssuer(
        // TODO check if there are better code patterns for sending txs
        obfuscatedId,
        address,
        NOW_TIMESTAMP
      );
    const receipt = await tx.wait();
    return receipt;
  }

  async deregisterOnChainIdentifier(
    plaintextId: string,
    identifierType: IdentifierPrefix,
    address: string
  ) {
    const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
      plaintextId,
      identifierType
    );
    const tx = await this.federatedAttestationsContract.revokeAttestation(
      obfuscatedId,
      this.wallet.address,
      address
    );
    const receipt = await tx.wait();
    return receipt;
  }

  async checkODISQuota() {
    const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
      this.wallet.address,
      this.authSigner,
      this.serviceContext
    );
    console.log("Remaining Quota", remainingQuota);
    return remainingQuota;
  }

  async lookup(
    plaintextId: string,
    identifierType: IdentifierPrefix,
    issuerAddresses: string[]
  ) {
    const obfuscatedId = await this.getObfuscatedIdWithQuotaRetry(
      plaintextId,
      identifierType
    );
    console.log(obfuscatedId);
    const attestations =
      await this.federatedAttestationsContract.lookupAttestations(
        obfuscatedId,
        issuerAddresses
      );
    console.log(attestations);
    return {
      accounts: attestations.accounts as string[], // TODO typesafety
      obfuscatedId,
    };
  }
}