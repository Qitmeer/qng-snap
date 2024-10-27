import { SLIP10Node } from '@metamask/key-tree';
import { ethers } from 'ethers';
import { ec, hash, address } from 'qitmeerts';
import * as uint8arraytools from 'uint8array-tools';
import { MeerChangeAddr } from '@qng/eip4337-sdk';
import { getConfig } from './config';
import {
  getMeerChangeABI,
  getAbstractAccount,
  getCurrentGasPrice,
  getCurrentPriorityFee,
  bundlerProvider,
} from './getAbstractAccount';
import {
  qngTransferUtxo,
  qngGetUTXOBalance,
  getMultiInputHash,
  getInputHash,
  qngGetAvailableUtxos,
  handleSignStr,
  trimHexPrefix,
  qngCheckUTXO,
} from './qngweb3';

export const CRYPTO_CURVE = 'secp256k1';

export const getQngAccount = async (): Promise<SLIP10Node> => {
  const qngNode = await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      // The path and curve must be specified in the initial permissions.
      // 813 is meer bip44 network code
      path: ['m', "44'", "813'"],
      curve: 'secp256k1',
    },
  });

  // Next, create an instance of a SLIP-10 node for the Qng node.
  const qngSlip10Node = await SLIP10Node.fromJSON(qngNode);
  // m/44'/813'/0
  const accountKey0 = await qngSlip10Node.derive(['bip32:0']);
  return accountKey0;
};

export const getQngAddress = async (chainId: number): Promise<string> => {
  const conf = getConfig(chainId);
  const account = await getQngAccount();
  const privKey = ec.fromPrivateKey(
    uint8arraytools.fromHex(trimHexPrefix(account.privateKey as string)),
    {},
  );
  const pub = privKey.publicKey;
  const h16 = hash.hash160(pub);
  const addr = address.toBase58Check(h16, conf.networkConf.pubKeyHashAddrId);
  return addr;
};

export const getQngBalance = async (chainId: number): Promise<string> => {
  const addr = await getQngAddress(chainId);
  const ba = await qngGetUTXOBalance(addr, chainId);
  return ba;
};
export const getQngBalanceByAddress = async (
  chainId: number,
  addr: string,
): Promise<string> => {
  const ba = await qngGetUTXOBalance(addr, chainId);
  return ba;
};
export const sendToBundler = async (
  ops: string,
  fee: number,
  chainId: number,
): Promise<string> => {
  const aa = await getAbstractAccount(chainId);
  const abi = await getMeerChangeABI(chainId);
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  const accounts = await provider.send('eth_requestAccounts', []);
  const signature = (await ethereum.request({
    method: 'personal_sign',
    params: [getMultiInputHash(ops, fee), accounts[0]],
  })) as string;
  const data = await abi.encodeExport4337(ops, fee, handleSignStr(signature));
  const currentGasPrice = await getCurrentPriorityFee();

  const maxPriorityFeePerGas = currentGasPrice.add(
    ethers.utils.parseUnits('10', 'gwei'),
  );
  const cFeePerGas = await getCurrentGasPrice();
  const maxFeePerGas = cFeePerGas.add(ethers.utils.parseUnits('10', 'gwei'));
  const userOp = await aa.createSignedUserOp({
    target: '0x18D86ABE638066254878Bd4964E048707d593ef3',
    value: 0,
    data,
    gasLimit: 200000,
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  });
  const bp = await bundlerProvider(chainId);
  const userOpHash = await bp.sendUserOpToBundler(userOp);
  const txhash = await aa.getUserOpReceipt(userOpHash);
  return txhash as string;
};
export const checkTxIdSig = async (
  txid: string,
  idx: number,
  sign: string,
  chainId: number,
): Promise<string> => {
  const ret = uint8arraytools.toHex(getInputHash(txid, idx));
  return qngCheckUTXO(txid, idx, handleSignStr(sign), chainId);
};
export const ethSign = async (
  ops: string,
  fee: number,
  chainId: number,
): Promise<string> => {
  const txhash = await sendToBundler(ops, fee, chainId);
  return txhash;
};

export const walletSign = async (
  ops: string,
  fee: number,
  chainId: number,
): Promise<string> => {
  return '';
  // const account = await getQngAccount();
  // const privKey = ec.fromPrivateKey(
  //   uint8arraytools.fromHex(trimHexPrefix(account.privateKey as string)),
  //   {},
  // );
  // const wallet = new ethers.Wallet(
  //   uint8arraytools.toHex(privKey.privateKey as Uint8Array),
  // );
  // const signature = await wallet.signMessage(getMultiInputHash(ops, fee));

  // const txhash = await sendToBundler(
  //   ops,
  //   fee,
  //   handleSignStr(signature),
  //   chainId,
  // );
  // // get the eth address
  // return `${wallet.address}:${txhash}`;
};

export const qngTransfer = async (
  _from: string,
  _target: string,
  _amount: string,
  chainId: number,
): Promise<string> => {
  const account = await getQngAccount();
  const privKey = ec.fromPrivateKey(
    uint8arraytools.fromHex(trimHexPrefix(account.privateKey as string)),
    {},
  );
  // create a new tx-signer
  const txid = qngTransferUtxo(
    _from,
    _target,
    Number(_amount),
    privKey,
    chainId,
  );
  return txid;
};
export const getOneUtxo = async (
  from: string,
  chainId: number,
): Promise<string> => {
  const last = await qngGetAvailableUtxos(from, chainId);
  if (!last) {
    return '';
  }
  if (last.length < 1) {
    return '';
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${last[0]?.txid}:${last[0]?.idx}:${last[0]?.amount}`;
};

export const get50Utxos = async (
  from: string,
  chainId: number,
): Promise<[]> => {
  const utxos = await qngGetAvailableUtxos(from, chainId);
  if (!utxos) {
    return [];
  }
  if (utxos.length < 1) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return utxos as any;
};
