import { SLIP10Node } from '@metamask/key-tree';
import { ethers } from 'ethers';
import { ec, hash, address, networks } from 'qitmeerts';
import * as uint8arraytools from 'uint8array-tools';

import {
  qngTransferUtxo,
  qngGetUTXOBalance,
  transferUTXOToEvmWithEthSign,
  getInputHash,
  qngGetAvailableUtxos,
  crossSendtoBunder,
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

  // Next, create an instance of a SLIP-10 node for the Dogecoin node.
  const qngSlip10Node = await SLIP10Node.fromJSON(qngNode);
  // m/44'/813'/0
  const accountKey0 = await qngSlip10Node.derive(['bip32:0']);
  return accountKey0;
};

export const getQngAddress = async (): Promise<string> => {
  const account = await getQngAccount();
  const privKey = ec.fromPrivateKey(
    uint8arraytools.fromHex(trimHexPrefix(account.privateKey as string)),
    {},
  );
  const pub = privKey.publicKey;
  const h16 = hash.hash160(pub);
  const addr = address.toBase58Check(h16, networks.privnet.pubKeyHashAddrId);
  return addr;
};

export const getQngBalance = async (): Promise<string> => {
  const addr = await getQngAddress();
  const ba = await qngGetUTXOBalance(addr);
  return ba;
};

export const ethSign = async (
  txid: string,
  idx: number,
  fee: number,
): Promise<string> => {
  const signRes = await transferUTXOToEvmWithEthSign(txid, idx, fee);
  return signRes;
};

export const walletSign = async (
  txid: string,
  idx: number,
  fee: number,
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
  const txhash = await crossSendtoBunder(
    txid,
    idx,
    fee,
    handleSignStr(signature),
  );
  return txhash;
};

export const qngTransfer = async (
  _from: string,
  _target: string,
  _amount: string,
): Promise<string> => {
  const account = await getQngAccount();
  const privKey = ec.fromPrivateKey(
    uint8arraytools.fromHex(trimHexPrefix(account.privateKey as string)),
    {},
  );
  // create a new tx-signer
  const txid = qngTransferUtxo(_from, _target, Number(_amount), privKey);
  return txid;
};
export const getOneUtxo = async (from: string): Promise<string> => {
  const last = await qngGetAvailableUtxos(from);
  if (last.length < 1) {
    return '';
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${last[0]?.txid}:${last[0]?.idx}:${last[0]?.amount}`;
};
