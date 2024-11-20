import type { QuoteResponse, QuoteResponseRoute } from "@swapkit/api";
import { AssetValue, Chain, FeeTypeEnum, ProviderName, RequestClient } from "@swapkit/helpers";
import type { SwapKitPluginParams, WalletChain } from "@swapkit/helpers";
import { ChainToKadoChain } from "./helpers";

export type KadoFiatCurrency =
  | "USD"
  | "CAD"
  | "GBP"
  | "EUR"
  | "MXN"
  | "COP"
  | "INR"
  | "CHF"
  | "AUD"
  | "ARS"
  | "BRL"
  | "CLP"
  | "JPY"
  | "KRW"
  | "PEN"
  | "PHP"
  | "SGD"
  | "TRY"
  | "UYU"
  | "TWD"
  | "VND"
  | "CRC"
  | "SEK"
  | "PLN"
  | "DKK"
  | "NOK"
  | "NZD";

export type KadoFiatMethod =
  | "ach"
  | "debit_card"
  | "credit_card"
  | "apple_pay_credit"
  | "apple_pay_debit"
  | "wire"
  | "sepa"
  | "pix"
  | "koywe";

export type KadoQuoteRequest = {
  transactionType: "buy" | "sell";
  fiatMethod: KadoFiatMethod;
  partner: "fortress";
  amount: string;
  asset: string;
  blockchain: string;
  currency: KadoFiatCurrency;
};

type KadoQuoteResponse = {
  success: boolean;
  message: string;
  data: {
    quote: {
      receive: {
        amount: number;
        originalAmount: number;
        symbol: string;
        unit: string;
        unitCount: number;
      };
      networkFee: {
        amount: number;
        currency: string;
        originalAmount: number;
        promotionModifier: number;
      };
      processingFee: {
        amount: number;
        currency: string;
        originalAmount: number;
        promotionModifier: number;
      };
      totalFee: {
        amount: number;
        currency: string;
        originalAmount: number;
      };
    };
  };
};

function mapKadoQuoteToQuoteResponse({
  quote,
  sellAsset,
  buyAsset,
}: {
  quote: KadoQuoteResponse;
  sellAsset: AssetValue;
  buyAsset: AssetValue;
}): QuoteResponse {
  const routes: QuoteResponseRoute[] = [
    {
      providers: [ProviderName.KADO],
      sellAsset: sellAsset.toString(),
      sellAmount: sellAsset.getValue("string"),
      buyAsset: buyAsset.toString(),
      expectedBuyAmount: quote.data.quote.receive.amount.toString(),
      expectedBuyAmountMaxSlippage: quote.data.quote.receive.amount.toString(),
      sourceAddress: "{sourceAddress}",
      destinationAddress: "{destinationAddress}",
      fees: [
        {
          asset: quote.data.quote.processingFee.currency,
          amount: quote.data.quote.processingFee.amount.toString(),
          type: FeeTypeEnum.LIQUIDITY,
          protocol: ProviderName.KADO,
          chain: "FIAT",
        },
        {
          asset: quote.data.quote.networkFee.currency,
          amount: quote.data.quote.networkFee.amount.toString(),
          type: FeeTypeEnum.NETWORK,
          protocol: ProviderName.KADO,
          chain: buyAsset.chain,
        },
      ],
      totalSlippageBps: 0,
      legs: [
        {
          provider: ProviderName.KADO,
          sellAsset: sellAsset.toString(),
          sellAmount: sellAsset.getValue("string"),
          buyAsset: buyAsset.toString(),
          buyAmount: quote.data.quote.receive.unitCount.toString(),
          buyAmountMaxSlippage: quote.data.quote.receive.unitCount.toString(),
          fees: [],
        },
      ],
      warnings: [],
      meta: {},
    },
  ];

  return {
    quoteId: crypto.randomUUID(),
    routes,
    error: quote.success ? undefined : quote.message,
  };
}

export type KadoBlockchainsResponse = {
  success: boolean;
  message: string;
  data: {
    blockchains: {
      _id: string;
      supportedEnvironment: string;
      network: string;
      origin: string;
      label: string;
      associatedAssets: {
        _id: string;
        name: string;
        description: string;
        label: string;
        supportedProviders: string[];
        stablecoin: boolean;
        liveOnRamp: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
        priority: number;
      };
      avgTransactionTimeSeconds: number;
      usesAvaxRouter: boolean;
      liveOnRamp: boolean;
      createdAt: string;
      updatedAt: string;
      __v: number;
      priority: number;
    }[];
  };
};

export type KadoSupportedAssetsResponse = {
  success: boolean;
  message: string;
  data: {
    assets: {
      _id: string;
      name: string;
      description: string;
      label: string;
      symbol: string;
      supportedProviders: string[];
      stablecoin: boolean;
      liveOnRamp: boolean;
      createdAt: string;
      updatedAt: string;
      __v: number;
      priority: number;
    }[];
  };
};

function plugin({
  getWallet,
  config: { kadoApiKey },
}: SwapKitPluginParams<{ kadoApiKey: string }>) {
  //   async function onRampQuote(
  //     assetValue: AssetValue,
  //     fiatCurrency: KadoFiatCurrency,
  //     fiatMethod: KadoFiatMethod,
  //   ) {
  //     const blockchain = ChainToKadoChain(assetValue.chain);
  //     if (!blockchain) {
  //       throw new Error(`Asset chain ${assetValue.chain} not supported by Kado`);
  //     }

  //     try {
  //       const quoteRequest: KadoQuoteRequest = {
  //         transactionType: "buy",
  //         fiatMethod, // Default to SEPA, can be made configurable
  //         partner: "fortress",
  //         amount: assetValue.getValue("string"),
  //         asset: assetValue.symbol,
  //         blockchain,
  //         currency: fiatCurrency,
  //       };

  //       const quote = await RequestClient.get<{
  //         success: boolean;
  //         message: string;
  //         data: {
  //           quote: {
  //             receiveAmount: number;
  //             networkFee: number;
  //             processingFee: number;
  //             totalFee: number;
  //           };
  //         };
  //       }>("https://api.kado.money/v2/ramp/quote", {
  //         searchParams: quoteRequest,
  //         headers: {
  //           "X-Widget-Id": kadoApiKey,
  //         },
  //       });

  //       if (!quote.success) {
  //         throw new Error(quote.message);
  //       }

  //       return quote.data.quote;
  //     } catch (error) {
  //       throw new Error("core_swap_quote_error");
  //     }
  //   }

  //   async function offRampQuote(
  //     sellAsset: AssetValue,
  //     buyAsset: AssetValue,
  //     fiatCurrency: KadoFiatCurrency,
  //     fiatMethod: KadoFiatMethod,
  //   ) {
  //     const blockchain = ChainToKadoChain(assetValue.chain);
  //     if (!blockchain) {
  //       throw new Error("asset chain not supported");
  //     }
  //     try {
  //       const quoteRequest: KadoQuoteRequest = {
  //         transactionType: "sell",
  //         fiatMethod: "sepa", // Default to SEPA, can be made configurable
  //         partner: "fortress",
  //         amount: assetValue.getValue("string"),
  //         asset: assetValue.symbol,
  //         blockchain,
  //         currency: fiatCurrency,
  //       };

  //       const quote = await RequestClient.get<{
  //         success: boolean;
  //         message: string;
  //         data: {
  //           quote: {
  //             receiveAmount: number;
  //             networkFee: number;
  //             processingFee: number;
  //             totalFee: number;
  //           };
  //         };
  //       }>("https://api.kado.money/v2/ramp/quote", {
  //         json: quoteRequest,
  //         headers: {
  //           "X-Widget-Id": kadoApiKey,
  //         },
  //       });

  //       if (!quote.success) {
  //         throw new Error(quote.message);
  //       }

  //       return quote.data.quote;
  //     } catch (error) {
  //       throw new Error("core_swap_quote_error");
  //     }
  //   }

  async function fetchProviderQuote({
    sellAsset,
    buyAsset,
    fiatMethod,
  }: {
    sellAsset: AssetValue;
    buyAsset: AssetValue;
    fiatMethod: KadoFiatMethod;
  }) {
    try {
      const transactionType = sellAsset.chain === Chain.Fiat ? "buy" : "sell";

      const currency = (
        sellAsset.chain === Chain.Fiat ? sellAsset.symbol : buyAsset.symbol
      ) as KadoFiatCurrency;

      const asset = sellAsset.chain === Chain.Fiat ? buyAsset : sellAsset;

      const quoteRequest: KadoQuoteRequest = {
        transactionType,
        fiatMethod,
        partner: "fortress",
        amount: sellAsset.getValue("string"),
        asset: asset.symbol,
        blockchain: ChainToKadoChain(asset.chain),
        currency,
      };

      const quote = await RequestClient.get<KadoQuoteResponse>(
        "https://api.kado.money/v2/ramp/quote",
        {
          searchParams: quoteRequest,
          headers: {
            "X-Widget-Id": kadoApiKey,
          },
        },
      );

      return mapKadoQuoteToQuoteResponse({
        quote,
        sellAsset,
        buyAsset,
      });
    } catch (_error) {
      throw new Error("core_swap_quote_error");
    }
  }

  async function getBlockchains() {
    const response = await RequestClient.get<{
      success: boolean;
      message: string;
      data: {
        blockchains: {
          _id: string;
          supportedEnvironment: string;
          network: string;
          origin: string;
          label: string;
          associatedAssets: {
            _id: string;
            name: string;
            description: string;
            label: string;
            supportedProviders: string[];
            stablecoin: boolean;
            liveOnRamp: boolean;
            createdAt: string;
            updatedAt: string;
            __v: number;
            priority: number;
          };
          avgTransactionTimeSeconds: number;
          usesAvaxRouter: boolean;
          liveOnRamp: boolean;
          createdAt: string;
          updatedAt: string;
          __v: number;
          priority: number;
        }[];
      };
    }>("https://api.kado.money/v1/ramp/blockchains");

    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data.blockchains;
  }

  async function getAssets() {
    const response = await RequestClient.get<{
      success: boolean;
      message: string;
      data: {
        assets: {
          _id: string;
          name: string;
          description: string;
          label: string;
          symbol: string;
          supportedProviders: string[];
          stablecoin: boolean;
          liveOnRamp: boolean;
          createdAt: string;
          updatedAt: string;
          __v: number;
          priority: number;
        }[];
      };
    }>("https://api.kado.money/v1/ramp/supported-assets");

    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data.assets;
  }

  async function getOrderStatus(orderId: string) {
    try {
      const response = await RequestClient.get<{
        success: boolean;
        message: string;
        data: {
          order: {
            status: string;
            // Add other relevant fields from the API response
          };
        };
      }>(`https://api.kado.money/v2/public/orders/${orderId}`, {
        headers: {
          "X-Widget-Id": kadoApiKey,
        },
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data.order;
    } catch (_error) {
      throw new Error("Failed to get order status");
    }
  }

  function getKadoWidgetUrl({
    sellAsset,
    buyAsset,
    supportedAssets,
    recipient,
    networkList,
    type,
    typeList,
    widgetMode,
  }: {
    sellAsset: AssetValue;
    buyAsset: AssetValue;
    supportedAssets: AssetValue[];
    recipient: string;
    networkList: Chain[];
    type: "BUY" | "SELL";
    typeList: "BUY" | "SELL";
    widgetMode: "minimal" | "full";
  }) {
    const urlParams = new URLSearchParams({
      onPayAmount: sellAsset.getValue("string"),
      onPayCurrency: sellAsset.symbol,
      onRevCurrency: buyAsset.symbol,
      cryptoList: supportedAssets.map((asset) => asset.symbol).join(","),
      onToAddress: recipient,
      network: ChainToKadoChain(buyAsset.chain).toUpperCase(),
      networkList: networkList.map((chain) => ChainToKadoChain(chain).toUpperCase()).join(","),
      product: type,
      productList: typeList,
      mode: widgetMode,
    });

    return `https://app.kado.money/?${urlParams.toString()}`;
  }

  function createWidgetIframe(widgetUrl: string) {
    // Create the overlay element
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Grays out the background
    overlay.style.zIndex = "999";
    overlay.style.display = "none";

    // Create the iframe element
    const iframe = document.createElement("iframe");
    iframe.src = widgetUrl;
    iframe.style.position = "fixed";
    iframe.style.top = "50%";
    iframe.style.left = "50%";
    iframe.style.width = "80%";
    iframe.style.height = "80%";
    iframe.style.transform = "translate(-50%, -50%)";
    iframe.style.zIndex = "1000"; // On top of the overlay
    iframe.style.border = "none";
    iframe.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.5)";
    iframe.style.display = "none";

    // Append elements to the body
    document.body.appendChild(overlay);
    document.body.appendChild(iframe);

    // Add event listener to close the widget when clicking on the overlay
    overlay.addEventListener("click", () => {
      overlay.remove();
      iframe.remove();
    });
  }

  function swap({ route }: { route: QuoteResponseRoute }) {
    const widgetUrl = getKadoWidgetUrl({
      sellAsset: AssetValue.from({
        asset: route.sellAsset,
        value: route.sellAmount,
      }),
      buyAsset: AssetValue.from({
        asset: route.buyAsset,
        value: route.expectedBuyAmount,
      }),
      supportedAssets: [],
      recipient: route.buyAsset.startsWith("FIAT.")
        ? ""
        : getWallet(AssetValue.from({ asset: route.buyAsset })?.chain as WalletChain)?.address,
      networkList: [],
      type: "BUY",
      typeList: "BUY",
      widgetMode: "minimal",
    });

    createWidgetIframe(widgetUrl);
  }

  return {
    // onRampQuote,
    // offRampQuote,
    fetchProviderQuote,
    getBlockchains,
    getAssets,
    getOrderStatus,
    getKadoWidgetUrl,
    swap,
    supportedSwapkitProviders: [ProviderName.KADO],
  };
}

export const KadoPlugin = { kado: { plugin } } as const;
