/* eslint-disable prettier/prettier */
// import type { UserOperationStruct } from '@account-abstraction/contracts';
import { ethers } from 'ethers';
import {
  QngAccountAPI,
  HttpRpcClient,
  PaymasterAPI,
  // calcPreVerificationGas,
} from 'qitmeerts';
// import type { BigNumberish} from 'ethers';

import { getConfig } from './config';
// entryPointAddress
// const paymasterUrl = ''; // Optional
// Extend the Ethereum Foundation's account-abstraction/sdk's basic paymaster
class MeerChangePaymasterAPI extends PaymasterAPI {
  // eslint-disable-next-line no-restricted-syntax
  private readonly _paymasterUrl: string;

  // eslint-disable-next-line no-restricted-syntax
  private readonly _entryPoint: string;

  constructor(_paymasterUrl: string, entryPoint: string) {
    super();
    this._paymasterUrl = _paymasterUrl;
    this._entryPoint = entryPoint;
  }

  async getPaymasterAndData(userOp: any): Promise<string> {
    console.log(userOp);
    // Hack: userOp includes empty paymasterAndData which calcPreVerificationGas requires.
    const provider = new ethers.providers.Web3Provider(ethereum as any);
    const network = await provider.getNetwork();
    const conf = getConfig(network.chainId);
    return conf.paymasterAddress;
  }
}

export const getCurrentGasPrice = async (): Promise<ethers.BigNumber> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  const gasPrice = await provider.getGasPrice();
  console.log(`${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
  return gasPrice;
};

export const getCurrentPriorityFee = async (): Promise<ethers.BigNumber> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  const feeData = await provider.getFeeData();
  console.log(
    'Max Priority Fee Per Gas:',
    `${ethers.utils.formatUnits(
      feeData.maxPriorityFeePerGas as ethers.BigNumber,
      'gwei',
    )} Gwei`,
  );
  return feeData.maxPriorityFeePerGas as ethers.BigNumber;
};

// eslint-disable-next-line jsdoc/require-jsdoc
// async function optoJSON(op: Partial<UserOperationStruct>): Promise<any> {
//   const userOp = await ethers.utils.resolveProperties(op);
//   return Object.keys(userOp)
//     .map((key) => {
//       let val = (userOp as any)[key];
//       if (typeof val !== "string" || !val.startsWith("0x")) {
//         val = ethers.utils.hexValue(val);
//       }
//       return [key, val];
//     })
//     .reduce(
//       (set, [k, val]) => ({
//         ...set,
//         [k]: val,
//       }),
//       {}
//     );
// }

// qng testnet deployed
// entryPoint Contract https://github.com/eth-infinitism/account-abstraction/blob/v0.6.0/contracts/core/EntryPoint.sol
// deployed by deterministic-deployment-proxy https://github.com/Arachnid/deterministic-deployment-proxy.git
// entryPointAddress
// const paymasterAPI = new VerifyingPaymasterAPI(paymasterUrl, entryPointAddress);
// account factory Contract https://github.com/eth-infinitism/account-abstraction/blob/v0.6.0/contracts/samples/SimpleAccountFactory.sol
// deployed by deterministic-deployment-proxy https://github.com/Arachnid/deterministic-deployment-proxy.git
// const { factoryAddress } = getConfig();
// ** server response header set "Access-Control-Allow-Origin": "null" **
export const bundlerUrl = (chainId: number): string => {
  const conf = getConfig(chainId);
  return `${conf.proxyUrl}/bundler`;
};
export const qngUrl = (chainId: number): string => {
  const conf = getConfig(chainId);
  return `${conf.proxyUrl}/qng`;
};

// TODO crossQngUrl will be merged in bundlerUrl
export const crossQngUrl = (chainId: number): string => {
  const conf = getConfig(chainId);
  return `${conf.proxyUrl}/export`;
};
export const getAbstractAccount = async (
  chainId: number,
): Promise<QngAccountAPI> => {
  const conf = getConfig(chainId);
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  await provider.send('eth_requestAccounts', []);
  const paymasterAPI = new MeerChangePaymasterAPI('', conf.entryPointAddress);
  const owner = provider.getSigner();
  const aa = new QngAccountAPI({
    provider,
    entryPointAddress: conf.entryPointAddress,
    owner,
    factoryAddress: conf.factoryAddress,
    paymasterAPI,
  });
  return aa;
};

export const bundlerProvider = async (
  chainId: number,
): Promise<HttpRpcClient> => {
  const conf = getConfig(chainId);
  return new HttpRpcClient(
    bundlerUrl(chainId),
    conf.entryPointAddress,
    chainId,
  );
};
