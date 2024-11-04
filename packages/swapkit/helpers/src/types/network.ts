export const DefaultRPCUrl = {
  Arbitrum: "https://arb1.arbitrum.io/rpc",
  Avalanche: "https://node-router.thorswap.net/avalanche-c",
  Base: "https://base.llamarpc.com",
  BinanceSmartChain: "https://bsc-dataseed.binance.org",
  Bitcoin: "https://node-router.thorswap.net/bitcoin",
  BitcoinCash: "https://node-router.thorswap.net/bitcoin-cash",
  Chainflip: "wss://mainnet-archive.chainflip.io",
  Cosmos: "https://node-router.thorswap.net/cosmos/rpc",
  Dash: "https://node-router.thorswap.net/dash",
  Dogecoin: "https://node-router.thorswap.net/dogecoin",
  Ethereum: "https://node-router.thorswap.net/ethereum",
  Kujira: "https://kujira-rpc.publicnode.com:443",
  Litecoin: "https://node-router.thorswap.net/litecoin",
  Maya: "https://tendermint.mayachain.info",
  MayaStagenet: "https://stagenet.tendermint.mayachain.info",
  Optimism: "https://mainnet.optimism.io",
  Polkadot: "wss://rpc.polkadot.io",
  Polygon: "https://polygon-rpc.com",
  Radix: "https://radix-mainnet.rpc.grove.city/v1/326002fc/core",
  THORChain: "https://rpc.thorswap.net",
  THORChainStagenet: "https://stagenet-rpc.ninerealms.com",
  Solana: "https://solana-rpc.publicnode.com",
};

export let RPCUrl: typeof DefaultRPCUrl;

RPCUrl = { ...DefaultRPCUrl };

export const initializeRPCUrlsWithFallback = async (
  chains: (keyof typeof RPCUrl)[] = Object.keys(RPCUrl) as (keyof typeof RPCUrl)[],
) => {
  const { initializeWorkingRPCUrls } = await import("../helpers/others");
  const workingUrls = await initializeWorkingRPCUrls(chains);
  RPCUrl = { ...RPCUrl, ...workingUrls };
};

export const FALLBACK_URLS: Record<keyof typeof RPCUrl, string[]> = {
  Arbitrum: [
    "https://arb-mainnet.g.alchemy.com/v2/demo",
    "https://arbitrum.blockpi.network/v1/rpc/public",
  ],
  Avalanche: [
    "https://api.avax.network/ext/bc/C/rpc",
    "https://avalanche-c-chain-rpc.publicnode.com",
  ],
  Base: ["https://base.blockpi.network/v1/rpc/public", "https://1rpc.io/base"],
  BinanceSmartChain: ["https://bsc-rpc.gateway.pokt.network", "https://bsc-dataseed2.binance.org"],
  Bitcoin: ["https://bitcoin.publicnode.com"],
  BitcoinCash: ["https://bch-dataseed.binance.org", "https://bch.getblock.io/mainnet"],
  Chainflip: ["wss://archive-1.mainnet.chainflip.io", "wss://archive-2.mainnet.chainflip.io"],
  Cosmos: ["https://cosmos-rpc.quickapi.com", "https://cosmos-rpc.publicnode.com"],
  Dash: ["https://dash-rpc.publicnode.com"],
  Dogecoin: ["https://doge.getblock.io/mainnet", "https://dogecoin.publicnode.com"],
  Ethereum: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth"],
  Kujira: ["https://kujira-rpc.polkachu.com", "https://kujira-rpc.ibs.team"],
  Litecoin: ["https://ltc.getblock.io/mainnet", "https://litecoin.publicnode.com"],
  Maya: ["https://tendermint.mayachain.info", "https://maya-tendermint.publicnode.com"],
  MayaStagenet: ["https://stagenet-tendermint.mayachain.info"],
  Optimism: ["https://optimism.llamarpc.com", "https://1rpc.io/op"],
  Polkadot: ["wss://polkadot-rpc.dwellir.com", "wss://polkadot.api.onfinality.io/public-ws"],
  Polygon: ["https://polygon.llamarpc.com", "https://rpc.ankr.com/polygon"],
  Radix: ["https://mainnet.radixdlt.com", "https://radix-mainnet.rpc.grove.city/v1"],
  THORChain: ["https://thornode.ninerealms.com", "https://thornode.thorswap.net"],
  THORChainStagenet: ["https://stagenet-thornode.ninerealms.com"],
  Solana: ["https://api.mainnet-beta.solana.com", "https://rpc.ankr.com/solana"],
};

export enum ExplorerUrl {
  Arbitrum = "https://arbiscan.io",
  Avalanche = "https://snowtrace.io",
  Base = "https://basescan.org",
  BinanceSmartChain = "https://bscscan.com",
  Bitcoin = "https://blockchair.com/bitcoin",
  BitcoinCash = "https://www.blockchair.com/bitcoin-cash",
  Chainflip = "https://explorer.polkascan.io/polkadot",
  Cosmos = "https://www.mintscan.io/cosmos",
  Dash = "https://blockchair.com/dash",
  Dogecoin = "https://blockchair.com/dogecoin",
  Ethereum = "https://etherscan.io",
  Kujira = "https://finder.kujira.network/kaiyo-1",
  Litecoin = "https://blockchair.com/litecoin",
  Maya = "https://www.mayascan.org",
  Optimism = "https://optimistic.etherscan.io",
  Polkadot = "https://polkadot.subscan.io",
  Polygon = "https://polygonscan.com",
  Radix = "https://dashboard.radixdlt.com",
  THORChain = "https://runescan.io",
  Solana = "https://solscan.io",
}
