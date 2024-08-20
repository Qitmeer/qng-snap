import { networks } from 'qitmeerts';
import type { NetworkConfig } from 'qitmeerts/dist/src/networks';

export type Config = {
  entryPointAddress: string;
  factoryAddress: string;
  proxyUrl: string;
  networkConf: NetworkConfig;
};

export const PrivateConfig: Config = {
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x9406cc6185a346906296840746125a0e44976454',
  proxyUrl: 'http://127.0.0.1:8081',
  networkConf: networks.privnet,
};

export const TestConfig: Config = {
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x9406cc6185a346906296840746125a0e44976454',
  proxyUrl: 'http://47.242.255.132:8081',
  networkConf: networks.testnet,
};
export const MixConfig: Config = {
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x9406cc6185a346906296840746125a0e44976454',
  proxyUrl: 'http://127.0.0.1:8081',
  networkConf: networks.mixnet,
};
export const MainConfig: Config = {
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x9406cc6185a346906296840746125a0e44976454',
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
