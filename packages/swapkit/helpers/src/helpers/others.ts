import { RequestClient } from "../modules/requestClient";
import { type ErrorKeys, SwapKitError } from "../modules/swapKitError";
import { Chain, ChainId, FALLBACK_URLS, RPCUrl } from "../types";

// 10 rune for register, 1 rune per year
// MINIMUM_REGISTRATION_FEE = 11
export function getTHORNameCost(numberOfYears: number) {
  if (numberOfYears < 0)
    throw new SwapKitError({
      errorKey: "helpers_invalid_number_of_years",
      info: { numberOfYears },
    });
  return 10 + numberOfYears;
}

// 10 CACAO for register
// 1.0512 CACAO per year
export function getMAYANameCost(numberOfYears: number) {
  if (numberOfYears < 0)
    throw new SwapKitError({
      errorKey: "helpers_invalid_number_of_years",
      info: { numberOfYears },
    });
  // round to max 10 decimals
  return Math.round((10 + numberOfYears * 1.0512) * 1e10) / 1e10;
}

export function wrapWithThrow<T>(fn: () => T, errorKey?: ErrorKeys) {
  try {
    return fn();
  } catch (error) {
    if (errorKey) {
      throw new SwapKitError(errorKey, error);
    }

    return console.error(error);
  }
}

export function getChainIdentifier<T extends Chain>(chain: T) {
  switch (chain) {
    case Chain.THORChain:
      return `${chain}.RUNE`;

    case Chain.Cosmos:
      return `${chain}.ATOM`;

    case Chain.BinanceSmartChain:
      return `${chain}`;

    default:
      return `${chain}.${chain}`;
  }
}

const skipWarnings = ["production", "test"].includes(process.env.NODE_ENV || "");
const warnings = new Set();
export function warnOnce(condition: boolean, warning: string) {
  if (!skipWarnings && condition) {
    if (warnings.has(warning)) {
      return;
    }

    warnings.add(warning);
    console.warn(warning);
  }
}

export async function getDynamicChainId(chainId: ChainId = ChainId.THORChain) {
  if (![ChainId.THORChainStagenet, ChainId.THORChain, "thorchain-mainnet-v1"].includes(chainId))
    return chainId;
  try {
    const response = await RequestClient.get<{ result: { node_info: { network: string } } }>(
      `${chainId !== ChainId.THORChain ? RPCUrl.THORChainStagenet : RPCUrl.THORChain}/status`,
    );
    return response.result.node_info.network as ChainId;
  } catch (_error) {
    return chainId;
  }
}

const testRPCConnection = async (chain: keyof typeof RPCUrl, url: string): Promise<boolean> => {
  const getRpcBody = () => {
    switch (chain) {
      case "Arbitrum":
      case "Avalanche":
      case "Base":
      case "BinanceSmartChain":
      case "Ethereum":
      case "Optimism":
      case "Polygon":
        return {
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        };
      case "Bitcoin":
      case "Dogecoin":
      case "BitcoinCash":
      case "Dash":
      case "Litecoin":
        return {
          jsonrpc: "1.0",
          id: "test",
          method: "getblockchaininfo",
          params: [],
        };
      case "Cosmos":
      case "Kujira":
      case "Maya":
      case "MayaStagenet":
      case "THORChain":
      case "THORChainStagenet":
        return {
          id: 1,
          jsonrpc: "2.0",
          method: "status",
          params: {},
        };
      case "Polkadot":
        return {
          jsonrpc: "2.0",
          id: 1,
          method: "system_health",
          params: [],
        };
      case "Radix":
        return "";
      case "Solana":
        return {
          jsonrpc: "2.0",
          id: 1,
          method: "getHealth",
        };
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  };

  function getChainStatuEndpoint() {
    switch (chain) {
      case "Radix":
        return "/status/network-configuration";
      default:
        return "";
    }
  }

  try {
    const endpoint = url.startsWith("wss") ? url.replace("wss", "https") : url;
    const response = await fetch(`${endpoint}${getChainStatuEndpoint()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getRpcBody()),
      signal: AbortSignal.timeout(3000),
    });

    return response.ok;
  } catch {
    return false;
  }
};

export const getRPCUrl = async (chain: keyof typeof RPCUrl): Promise<string> => {
  const primaryUrl = RPCUrl[chain];

  if (await testRPCConnection(chain, primaryUrl)) {
    return primaryUrl;
  }

  // Try fallback URLs
  for (const fallbackUrl of FALLBACK_URLS[chain]) {
    if (await testRPCConnection(chain, fallbackUrl)) {
      return fallbackUrl;
    }
  }

  return primaryUrl;
};

export const initializeWorkingRPCUrls = async (
  chains: (keyof typeof RPCUrl)[] = Object.keys(RPCUrl) as (keyof typeof RPCUrl)[],
) => {
  const workingUrls: Record<keyof typeof RPCUrl, string> = {} as Record<
    keyof typeof RPCUrl,
    string
  >;

  await Promise.all(
    chains.map(async (chain) => {
      const workingUrl = await getRPCUrl(chain as keyof typeof RPCUrl);
      workingUrls[chain as keyof typeof RPCUrl] = workingUrl;
    }),
  );

  return workingUrls;
};
