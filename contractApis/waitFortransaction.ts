import { waitForTransactionReceipt } from "wagmi/actions";
import { OxString, WagmiConfig } from "./contractAddress";

export const waitForConfirmation = async(config: WagmiConfig, hash: OxString) => {
    return await waitForTransactionReceipt(config, {hash});
}