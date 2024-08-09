import { SLIP10Node } from '@metamask/key-tree';
import { ec, hash, address, networks } from 'qitmeerts';
import * as uint8arraytools from 'uint8array-tools';

import { qngTransferUtxo } from './qngweb3';

export const trimHexPrefix = (key: string) =>
  key.startsWith('0x') ? key.substring(2) : key;

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
  const addr = address.toBase58Check(h16, networks.testnet.pubKeyHashAddrId);
  return addr;
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
