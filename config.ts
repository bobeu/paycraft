import { http, createConfig } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { str } from "./components/utilities";

const projectId = process.env.NEXT_PUBLIC_PROJECTID;

export const connectors = connectorsForWallets(
    [
        {
            groupName: "Recommended",
            wallets: [injectedWallet],
        },
    ],
    {
        appName: "Paycraft",
        projectId: str(projectId),
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