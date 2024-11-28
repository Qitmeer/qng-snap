/* eslint-disable import/no-nodejs-modules */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// import type { UserOperationStruct } from '@account-abstraction/contracts';
import type { PaymasterAPI } from '@qng/eip4337-sdk';
import {
  QngAccountAPI,
  MeerChangeAPI,
  QngPaymasterAddr,
  QngAccountFactoryAddr,
  EntryPointAddr,
  MeerChangeAddr,
  HttpRpcClient,
  // calcPreVerificationGas,
} from '@qng/eip4337-sdk';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';

import { bundlerUrl } from './config';
import { qngCheckUTXO } from './qng';
// import type { BigNumberish} from 'ethers';
import { handleSignStr } from './sign';
// entryPointAddress
// const paymasterUrl = ''; // Optional
// Extend the Ethereum Foundation's account-abstraction/sdk's basic paymaster
class MeerChangePaymasterAPI implements PaymasterAPI {
  async getPaymasterAndData(userOp: any): Promise<string> {
    // Hack: userOp includes empty paymasterAndData which calcPreVerificationGas requires.
    return QngPaymasterAddr;
  }
}

export const getAbstractAccount = async (): Promise<QngAccountAPI> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  // await provider.send('eth_requestAccounts', []);
  const accounts = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];
  if (accounts.length === 0) {
    throw new Error('No connected accounts found.');
  }

  const owner = provider.getSigner();
  const paymasterAPI = new MeerChangePaymasterAPI();
  console.log('QngAccountFactoryAddr', QngAccountFactoryAddr);
  console.log({
    provider,
    entryPointAddress: EntryPointAddr,
    owner,
    factoryAddress: QngAccountFactoryAddr,
    paymasterAPI,
  });
  const aa = new QngAccountAPI({
    provider,
    entryPointAddress: EntryPointAddr,
    owner,
    factoryAddress: QngAccountFactoryAddr,
    paymasterAPI,
  });
  return aa;
};
export const getCurrentGasPrice = async (): Promise<ethers.BigNumber> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const gasPrice = await provider.getGasPrice();
  console.log(`${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
  return gasPrice;
};

export const getCurrentPriorityFee = async (): Promise<ethers.BigNumber> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const feeData = await provider.getFeeData();
  console.log(feeData);
  console.log(
    'Max Priority Fee Per Gas:',
    `${ethers.utils.formatUnits(
      feeData.maxPriorityFeePerGas as ethers.BigNumber,
      'gwei',
    )} Gwei`,
  );
  return feeData.maxPriorityFeePerGas as ethers.BigNumber;
};
export const getMeerChangeABI = async (): Promise<MeerChangeAPI> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const meerchageABI = new MeerChangeAPI({
    provider,
    meerchangeAddr: MeerChangeAddr,
  });
  return meerchageABI;
};
export const bundlerProvider = async (): Promise<HttpRpcClient> => {
  const chainId = parseInt(window.ethereum.chainId as unknown as string, 16);
  console.log(chainId, 'window.ethereum.chainId');
  return new HttpRpcClient(bundlerUrl(), EntryPointAddr, chainId);
};

export const createUserOp = async (
  ops: string,
  fee: number,
  signature: string,
): Promise<any> => {
  const aa = await getAbstractAccount();
  console.log('aa', await aa.getAccountAddress());
  const abi = await getMeerChangeABI();
  const data = await abi.encodeExport4337(ops, fee, handleSignStr(signature));
  const userOp = await aa.createSignedUserOp({
    target: MeerChangeAddr,
    value: 0,
    data,
    gasLimit: 200000,
    maxFeePerGas: await getCurrentGasPrice(),
    maxPriorityFeePerGas: await getCurrentPriorityFee(),
  });
  console.log('userOp', userOp);
  return userOp;
};
export const sendToBundler = async (
  ops: string,
  fee: number,
  signature: string,
): Promise<string> => {
  const userOp = await createUserOp(ops, fee, signature);
  const bp = await bundlerProvider();
  const userOpHash = await bp.sendUserOpToBundler(userOp);
  const aa = await getAbstractAccount();
  console.log('userOpHash', userOpHash);
  let txhash: any;
  for (let i = 0; i < 3; i++) {
    txhash = await aa.getUserOpReceipt(userOpHash);
    if (txhash !== null) {
      break;
    }
  }
  return txhash as string;
};
export const checkTxIdSig = async (
  txid: string,
  idx: number,
  sign: string,
): Promise<string> => {
  return qngCheckUTXO(txid, idx, handleSignStr(sign));
};
