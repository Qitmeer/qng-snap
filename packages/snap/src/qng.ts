import { Buffer } from 'buffer';
import { ec, hash, address, networks, txsign } from 'qitmeer-js';

import type { SLIP10Node } from './interface';
import { ScriptType } from './interface';

const createHash = require('create-hash');

export const trimHexPrefix = (key: string) =>
  key.startsWith('0x') ? key.substring(2) : key;
export const pathMap: Record<ScriptType, string[]> = {
  [ScriptType.P2PKH]: ['m', "44'", "0'"],
  [ScriptType.P2SHP2WPKH]: ['m', "49'", "0'"],
  [ScriptType.P2WPKH]: ['m', "84'", "0'"],
};

export const CRYPTO_CURVE = 'secp256k1';
// export const convertXpub = (xpub: string, to: ScriptType): string => {
//   const xpubPrefix = scriptTypeToXpubPrefix[to][net];

//   let data = decode(xpub);
//   data = data.slice(4);
//   data = Buffer.concat([Buffer.from(xpubPrefixes[xpubPrefix], 'hex'), data]);
//   return encode(data);
// };
export const getQngAddress = async (): Promise<string> => {
  const path = [...pathMap[ScriptType.P2PKH]];
  const slip10Node = (await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path,
      curve: CRYPTO_CURVE,
    },
  })) as SLIP10Node;
  // return trimHexPrefix(slip10Node.privateKey);
  const privKey = ec.fromPrivateKey(
    Buffer.from(trimHexPrefix(slip10Node.privateKey), 'hex'),
    {},
  );
  const pub = privKey.publicKey;
  console.log(pub.toString('hex'));
  // return pub.toString('hex');
  const h16 = await createHash('rmd160')
    .update(hash.blake2b256(pub))
    .digest('hex');
  const addr = address.toBase58Check(
    Buffer.from(h16, 'hex'),
    networks.testnet.pubKeyHashAddrId,
  );
  return addr;
};

export const qngTransfer = async (
  txid: string,
  target: string,
  amount: string,
): Promise<string> => {
  const path = [...pathMap[ScriptType.P2PKH]];
  const slip10Node = (await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path,
      curve: CRYPTO_CURVE,
    },
  })) as SLIP10Node;
  // return trimHexPrefix(slip10Node.privateKey);
  const privKey = ec.fromPrivateKey(
    Buffer.from(trimHexPrefix(slip10Node.privateKey), 'hex'),
    {},
  );
  // create a new tx-signer
  const txsnr = txsign.newSigner(networks.testnet);
  txsnr.setVersion(1);
  // alex's previous transaction output, has 450 qitmeer
  const arr = txid.split(':');
  txsnr.addInput(arr[0], Number(arr[1]));
  txsnr.addOutput(target, Number(amount));
  // (in)45000000000 - (out)44990000000 = (miner fee)10000000
  // return 'xxxxxxxxxxxxxxxxxx';
  // sign
  txsnr.sign(0, privKey);
  // get raw Tx
  const rawTx = txsnr.build().toBuffer();
  return rawTx.toString('hex');
};
