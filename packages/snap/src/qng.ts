import { SLIP10Node } from '@metamask/key-tree';
import { Buffer } from 'buffer';
import { ec, hash, address, networks } from 'qitmeer-js';

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
    Buffer.from(trimHexPrefix(account.privateKey as string), 'hex'),
    {},
  );
  const pub = privKey.publicKey;
  console.log(pub.toString('hex'));
  const h16 = await hash.hash160(pub);
  const addr = address.toBase58Check(
    Buffer.from(h16),
    networks.testnet.pubKeyHashAddrId,
  );
  return addr;
};

export const qngTransfer = async (
  _from: string,
  _target: string,
  _amount: string,
): Promise<string> => {
  const account = await getQngAccount();
  const privKey = ec.fromPrivateKey(
    Buffer.from(trimHexPrefix(account.privateKey as string), 'hex'),
    {},
  );
  // create a new tx-signer
  const txid = qngTransferUtxo(_from, _target, Number(_amount), privKey);
  return txid;
};
