import { ChainToRPC, type EVMChain } from "@internal/helpers";
import { JsonRpcProvider } from "ethers";

export const getProvider = (chain: EVMChain, customUrl?: string) => {
  return new JsonRpcProvider(customUrl || ChainToRPC[chain]);
};
