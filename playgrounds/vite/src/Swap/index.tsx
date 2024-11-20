"use client";
import { AssetValue, FeeOption, type QuoteResponseRoute } from "@swapkit/sdk";
import { useCallback } from "react";

import type { SwapKitClient } from "../swapKitClient";
import { SwapInputs } from "./SwapInputs";

export default function Swap({
  inputAsset,
  outputAsset,
  skClient,
}: {
  inputAsset?: AssetValue;
  outputAsset?: AssetValue;
  skClient?: SwapKitClient;
}) {
  const handleSwap = useCallback(
    async (route: QuoteResponseRoute, isChainFlipBoost = false) => {
      const inputChain = inputAsset?.chain;
      const outputChain = outputAsset?.chain;
      if (!(outputChain && inputChain && skClient)) return;

      const txHash = await skClient.swap({
        route,
        feeOptionKey: FeeOption.Fast,
        ...(isChainFlipBoost ? { maxBoostFeeBps: 10 } : {}),
      });

      window.open(skClient.getExplorerTxUrl({ chain: inputChain, txHash }), "_blank");
    },
    [inputAsset, outputAsset?.chain, skClient],
  );

  const kadoWidget = async () => {
    const quote = await skClient?.kado.onRampQuote({
      assetValue: AssetValue.from({ asset: "ETH.ETH", value: 0.01 }),
      fiatValue: AssetValue.from({ asset: "FIAT.USD", value: 1000 }),
    });

    if (quote?.routes[0]) {
      skClient?.kado.swap({ route: quote.routes[0] });
    }
  };

  kadoWidget();

  return (
    <>
      <h4>Swap</h4>
      <SwapInputs
        handleSwap={handleSwap}
        inputAsset={inputAsset}
        outputAsset={outputAsset}
        skClient={skClient}
      />
    </>
  );
}
