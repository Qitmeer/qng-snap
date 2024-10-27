import { networks } from 'qitmeerts';
import type { NetworkConfig } from 'qitmeerts/dist/src/networks';

export type Config = {
  proxyUrl: string;
  networkConf: NetworkConfig;
};

export const PrivateConfig: Config = {
  proxyUrl: 'http://127.0.0.1:8081',
  networkConf: networks.privnet,
};

export const TestConfig: Config = {
  proxyUrl: 'https://47.242.255.132',
  networkConf: networks.testnet,
};
export const MixConfig: Config = {
  proxyUrl: 'http://127.0.0.1:8081',
  networkConf: networks.mixnet,
};
export const MainConfig: Config = {
  proxyUrl: 'http://127.0.0.1:8081',
  networkConf: networks.mainnet,
};

export const getConfig = (chainId: number): Config => {
  switch (chainId) {
    case 813:
      return MainConfig;
    case 8131:
      return TestConfig;
    case 8132:
      return MixConfig;
    default:
      return PrivateConfig;
  }
};
