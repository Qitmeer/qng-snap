/* eslint-disable prettier/prettier */
// import type { UserOperationStruct } from '@account-abstraction/contracts';
import {
  SimpleAccountAPI,
  HttpRpcClient,
  // PaymasterAPI,
  // calcPreVerificationGas,
} from '@account-abstraction/sdk';
// import type { BigNumberish} from 'ethers';
import { ethers } from 'ethers';

import { getConfig } from './config';
// entryPointAddress
// const paymasterUrl = ''; // Optional
// Extend the Ethereum Foundation's account-abstraction/sdk's basic paymaster
// class VerifyingPaymasterAPI extends PaymasterAPI {
//   // eslint-disable-next-line no-restricted-syntax
//   private readonly _paymasterUrl: string;

//   // eslint-disable-next-line no-restricted-syntax
//   private readonly _entryPoint: string;

//   constructor(_paymasterUrl: string, entryPoint: string) {
//     super();
//     this._paymasterUrl = _paymasterUrl;
//     this._entryPoint = entryPoint;
//   }

//   async getPaymasterAndData(
//     userOp: Partial<UserOperationStruct>,
//   ): Promise<string> {
//     // Hack: userOp includes empty paymasterAndData which calcPreVerificationGas requires.
//     try {
//       // userOp.preVerificationGas contains a promise that will resolve to an error.
//       await ethers.utils.resolveProperties(userOp);
//       // eslint-disable-next-line no-empty
//     } catch (_) {}
//     const pmOp: Partial<UserOperationStruct> = {
//       sender: userOp.sender as string,
//       nonce: userOp.nonce as BigNumberish,
//       initCode: userOp.initCode as string,
//       callData: userOp.callData as string,
//       callGasLimit: userOp.callGasLimit as BigNumberish,
//       verificationGasLimit: userOp.verificationGasLimit as BigNumberish,
//       maxFeePerGas: userOp.maxFeePerGas as BigNumberish,
//       maxPriorityFeePerGas: userOp.maxPriorityFeePerGas as BigNumberish,
//       // Dummy signatures are required in order to calculate a correct preVerificationGas value.
//       paymasterAndData:
//         '0x0101010101010101010101010101010101010101000000000000000000000000000000000000000000000000000001010101010100000000000000000000000000000000000000000000000000000000000000000101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101',
//       signature:
//         '0xa15569dd8f8324dbeabf8073fdec36d4b754f53ce5901e283c6de79af177dc94557fa3c9922cd7af2a96ca94402d35c39f266925ee6407aeb32b31d76978d4ba1c',
//     };
//     const op = await ethers.utils.resolveProperties(pmOp);
//     op.preVerificationGas = calcPreVerificationGas(op);
//     op.verificationGasLimit = ethers.BigNumber.from(
//       op.verificationGasLimit,
//     ).mul(3);

//     // Ask the paymaster to sign the transaction and return a valid paymasterAndData value.
//     const params = [await optoJSON(op), this._entryPoint, { "type": "payg" }];
//     const provider = new ethers.providers.JsonRpcProvider(paymasterUrl);
//     const response = await provider.send("pm_sponsorUserOperation", params);

//     return response.data.result.toString();
//   }
// }

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
): Promise<SimpleAccountAPI> => {
  const conf = getConfig(chainId);
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  await provider.send('eth_requestAccounts', []);
  const owner = provider.getSigner();
  const aa = new SimpleAccountAPI({
    provider,
    entryPointAddress: conf.entryPointAddress,
    owner,
    factoryAddress: conf.factoryAddress,
    // paymasterAPI,
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
