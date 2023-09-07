import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Chain, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  arbitrum,
  goerli,
  mainnet,
  optimism,
  polygon,
  base,
  zora,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const localA: Chain = {
  id: 31_337,
  name: 'localA',
  network: 'localA',
  iconUrl: 'https://example.com/icon.svg',
  iconBackground: '#fff',
  nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
  },
  rpcUrls: {
      public: { http: ['http://127.0.0.1:8545'] },
      default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

const localB: Chain = {
  id: 31_338,
  name: 'localB',
  network: 'localB',
  iconUrl: 'https://example.com/icon.svg',
  iconBackground: '#fff',
  nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
  },
  rpcUrls: {
      public: { http: ['http://127.0.0.1:8546'] },
      default: { http: ['http://127.0.0.1:8546'] },
  },
  testnet: true,
};



const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
      goerli,
      localA,
      localB,
      ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
