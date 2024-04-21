import { http, WagmiProvider, createConfig } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    RainbowKitProvider,
    connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";


export const connectors = connectorsForWallets(
    [
        {
            groupName: "Recommended",
            wallets: [injectedWallet],
        },
    ],
    {
        appName: "Celo Composer",
        projectId: "044601f65212332475a09bc14ceb3c34",
    }
);

export const config = createConfig({
    connectors,
    chains: [celo, celoAlfajores],
    transports: {
        [celo.id]: http(),
        [celoAlfajores.id]: http(),
    },
    batch: {
        multicall: true,
        
    }
});

export const queryClient = new QueryClient();