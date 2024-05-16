'use client'

// ChakraUI
import { ChakraProvider } from '@chakra-ui/react'

// RainbowKit
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// CSS
import './globals.css'

// Wagmi
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat, sepolia, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';

// React
import { createContext, useState } from 'react';

// :::::::::::::::::::::::CONFIGURATION:::::::::::::::::::::::::::::::

const { chains, publicClient } = configureChains(
  [/*hardhat, sepolia,*/ polygon],
  [
      alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID }),
      publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: process.env.NEXT_PUBLIC_WC_ID,
  chains
});
const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient
})

export const StateContext = createContext();

// ::::::::::::::::::::::::::RENDER:::::::::::::::::::::::::::::::::::

export default function RootLayout({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  return (
    <html lang="en">
      <head>
        <title>Block News</title>
        <link rel="icon" href="/icon.png" type="image/x-icon"/>
      </head>
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <ChakraProvider>
              <StateContext.Provider value={{ isConnected, setIsConnected }}>
                {children}
              </StateContext.Provider>
            </ChakraProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}