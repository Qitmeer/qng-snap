import { SLIP10Node } from '@metamask/key-tree';
import { ethers } from 'ethers';
import { ec, hash, address } from 'qitmeerts';
import * as uint8arraytools from 'uint8array-tools';

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
  transferUTXOToEvmWithEthSign,
  getInputHash,
  qngGetAvailableUtxos,
  handleSignStr,
  trimHexPrefix,
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
export const sendToBundler = async (
  txid: string,
  idx: number,
  fee: number,
  signature: string,
  chainId: number,
): Promise<string> => {
  const conf = getConfig(chainId);
  const aa = await getAbstractAccount(chainId);
  const abi = await getMeerChangeABI(chainId);
  const data = await abi.encodeExport4337(txid, idx, fee, signature);
  // const iface = new ethers.utils.Interface(MeerChangeABI);
  // const data = iface.encodeFunctionData('export4337', [
  //   ethers.utils.hexZeroPad(`0x${txid}`, 32),
  //   idx,
  //   fee,
  //   signature,
  // ]);
  const userOp = await aa.createSignedUserOp({
    target: conf.meerchangeAddress,
    value: 0,
    data,
    gasLimit: 200000,
    maxFeePerGas: await getCurrentGasPrice(),
    maxPriorityFeePerGas: await getCurrentPriorityFee(),
  });
  const bp = await bundlerProvider(chainId);
  const userOpHash = await bp.sendUserOpToBundler(userOp);
  const txhash = await aa.getUserOpReceipt(userOpHash);
  return txhash as string;
};
export const ethSign = async (
  txid: string,
  idx: number,
  fee: number,
  chainId: number,
): Promise<string> => {
  const signature = await transferUTXOToEvmWithEthSign(txid, idx, fee, chainId);
  const txhash = await sendToBundler(
    txid,
    idx,
    fee,
    handleSignStr(signature),
    chainId,
  );
  return txhash;
};

export const walletSign = async (
  txid: string,
  idx: number,
  fee: number,
  chainId: number,
): Promise<string> => {
  const account = await getQngAccount();
  const privKey = ec.fromPrivateKey(
    uint8arraytools.fromHex(trimHexPrefix(account.privateKey as string)),
    {},
  );
  const wallet = new ethers.Wallet(
    uint8arraytools.toHex(privKey.privateKey as Uint8Array),
  );
  const signature = await wallet.signMessage(getInputHash(txid, idx, fee));

  const txhash = await sendToBundler(
    txid,
    idx,
    fee,
    handleSignStr(signature),
    chainId,
  );
  // get the eth address
  return `${wallet.address}:${txhash}`;
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
