import { SupportedChainId } from './chains'




export const FALLBACK_URLS: { [key in SupportedChainId]: string[] } = {
  [SupportedChainId.MAINNET]: [
    // "Safe" URLs
    'https://api.mycryptoapi.com/eth',
    'https://cloudflare-eth.com',
    // "Fallback" URLs
    'https://rpc.ankr.com/eth',
    'https://eth-mainnet.public.blastapi.io',
  ],
  [SupportedChainId.ROPSTEN]: [
    // "Fallback" URLs
    'https://rpc.ankr.com/eth_ropsten',
  ],
  [SupportedChainId.RINKEBY]: [
    // "Fallback" URLs
    'https://rinkeby-light.eth.linkpool.io/',
  ],
  [SupportedChainId.GOERLI]: [
    // "Safe" URLs
    'https://rpc.goerli.mudit.blog/',
    // "Fallback" URLs
    'https://rpc.ankr.com/eth_goerli',
  ],
  [SupportedChainId.KOVAN]: [
    // "Safe" URLs
    'https://kovan.poa.network',
    // "Fallback" URLs
    'https://eth-kovan.public.blastapi.io',
  ],
  [SupportedChainId.POLYGON]: [
    // "Safe" URLs
    'https://polygon-rpc.com/',
    'https://rpc-mainnet.matic.network',
    'https://matic-mainnet.chainstacklabs.com',
    'https://rpc-mainnet.maticvigil.com',
    'https://rpc-mainnet.matic.quiknode.pro',
    'https://matic-mainnet-full-rpc.bwarelabs.com',
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    // "Safe" URLs
    'https://matic-mumbai.chainstacklabs.com',
    'https://rpc-mumbai.maticvigil.com',
    'https://matic-testnet-archive-rpc.bwarelabs.com',
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    // "Safe" URLs
    'https://arb1.arbitrum.io/rpc',
    // "Fallback" URLs
    'https://arbitrum.public-rpc.com',
  ],
  [SupportedChainId.ARBITRUM_RINKEBY]: [
    // "Safe" URLs
    'https://rinkeby.arbitrum.io/rpc',
  ],
  [SupportedChainId.OPTIMISM]: [
    // "Safe" URLs
    'https://mainnet.optimism.io/',
    // "Fallback" URLs
    'https://rpc.ankr.com/optimism',
  ],
  [SupportedChainId.BINANCE]: [],
  [SupportedChainId.OPTIMISTIC_KOVAN]: []
}

/**
 * Known JSON-RPC endpoints.
 * These are the URLs used by the interface when there is not another available source of chain data.
 */
export const RPC_URLS: { [key in SupportedChainId]: string[] } = {
  [SupportedChainId.MAINNET]: [
    `https://cloudflare-eth.com`,
    ...FALLBACK_URLS[SupportedChainId.MAINNET],
  ],
  [SupportedChainId.RINKEBY]: [
    `https://rinkeby-light.eth.linkpool.io`,
    ...FALLBACK_URLS[SupportedChainId.RINKEBY],
  ],
  [SupportedChainId.ROPSTEN]: [
    `https://ropsten-light.eth.linkpool.io`,
    ...FALLBACK_URLS[SupportedChainId.ROPSTEN],
  ],
  [SupportedChainId.GOERLI]: [`https://goerli-light.eth.linkpool.io`, ...FALLBACK_URLS[SupportedChainId.GOERLI]],
  [SupportedChainId.KOVAN]: [`https://kovan.poa.network`, ...FALLBACK_URLS[SupportedChainId.KOVAN]],
  [SupportedChainId.OPTIMISM]: [
    `https://mainnet.optimism.io`,
    ...FALLBACK_URLS[SupportedChainId.OPTIMISM],
  ],

  [SupportedChainId.ARBITRUM_ONE]: [
    `https://rpc.ankr.com/arbitrum`,
    ...FALLBACK_URLS[SupportedChainId.ARBITRUM_ONE],
  ],
  [SupportedChainId.ARBITRUM_RINKEBY]: [
    `https://rinkeby.arbitrum.io/rpc`,
    ...FALLBACK_URLS[SupportedChainId.ARBITRUM_RINKEBY],
  ],
  [SupportedChainId.POLYGON]: [
    `https://polygon-rpc.com`,
    ...FALLBACK_URLS[SupportedChainId.POLYGON],
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    `https://rpc-mumbai.maticvigil.com`,
    ...FALLBACK_URLS[SupportedChainId.POLYGON_MUMBAI],
  ],
  [SupportedChainId.BINANCE]: [`https://bsc-dataseed1.defibit.io`,
    ...FALLBACK_URLS[SupportedChainId.BINANCE],],
  [SupportedChainId.OPTIMISTIC_KOVAN]: []
}
