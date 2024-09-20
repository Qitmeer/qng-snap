import { networks } from 'qitmeerts';
import type { NetworkConfig } from 'qitmeerts/dist/src/networks';

export type Config = {
  entryPointAddress: string;
  factoryAddress: string;
  paymasterAddress: string;
  proxyUrl: string;
  networkConf: NetworkConfig;
  meerchangeAddress: string;
};

export const PrivateConfig: Config = {
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x9406cc6185a346906296840746125a0e44976454',
  paymasterAddress: '0x0C170fAe5584421092D624425c85156758c190e0',
  proxyUrl: 'http://127.0.0.1:8081',
  networkConf: networks.privnet,
  meerchangeAddress: '0x422f6F90B35D91D7D4F03aC791c6C07b1c14af1f',
};

export const TestConfig: Config = {
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x9406cc6185a346906296840746125a0e44976454',
  paymasterAddress: '0x0C170fAe5584421092D624425c85156758c190e0',
  proxyUrl: 'https://47.242.255.132',
  networkConf: networks.testnet,
  meerchangeAddress: '0x422f6F90B35D91D7D4F03aC791c6C07b1c14af1f',
};
export const MixConfig: Config = {
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x9406cc6185a346906296840746125a0e44976454',
  paymasterAddress: '0x0C170fAe5584421092D624425c85156758c190e0',
  proxyUrl: 'http://127.0.0.1:8081',
  networkConf: networks.mixnet,
  meerchangeAddress: '0x422f6F90B35D91D7D4F03aC791c6C07b1c14af1f',
};
export const MainConfig: Config = {
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  factoryAddress: '0x9406cc6185a346906296840746125a0e44976454',
  paymasterAddress: '0x0C170fAe5584421092D624425c85156758c190e0',
  proxyUrl: 'http://127.0.0.1:8081',
  networkConf: networks.mainnet,
  meerchangeAddress: '0x422f6F90B35D91D7D4F03aC791c6C07b1c14af1f',
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
