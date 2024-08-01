import { ethers } from 'ethers';

import { txsign, networks } from './qitmeerlib';

// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_getUTXOBalance",
//   "params": [
//     "TnJdESQUPsA9mLrVf2NWRXiobdMUoCBH3h8"
//   ],
//   "id": 1
// }
// jsonrpc Response
// {
//   "jsonrpc": "2.0",
//   "error": {
//     "code": 0,
//     "message": "ok",
//     "data": '100000000'
//   },
//   "id": 1
// }
export const qngGetUTXOBalance = async (addr: string): Promise<string> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  // const httpProvider = new ethers.providers.JsonRpcProvider();
  await provider.getNetwork();
  const params = [addr];
  const result = await provider.send('qng_getUTXOBalance', params);
  try {
    return result;
  } catch (error) {
    return '100000000';
  }
};

type UTXO = {
  txid: string;
  outputindex: number;
  amount: number;
};

// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_getAvaliableUTXOs",
//   "params": [
//     "TnJdESQUPsA9mLrVf2NWRXiobdMUoCBH3h8"
//   ],
//   "id": 1
// }
// jsonrpc Response
// {
//   "jsonrpc": "2.0",
//   "error": {
//     "code": 0,
//     "message": "ok",
//     "data": [{"txid":"13243545abcd232432545...","outputindex":1,"amount":10000000000},{"txid":"e123243545abcd23243254568...","outputindex":3,"amount":20000000000}]
//   },
//   "id": 1
// }
export const qngGetAvailableUtxos = async (addr: string): Promise<UTXO[]> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  // const httpProvider = new ethers.providers.JsonRpcProvider();
  await provider.getNetwork();
  const params = [addr];
  const result = await provider.send('qng_getAvaliableUTXOs', params);
  try {
    return result as UTXO[];
  } catch (error) {
    return [] as UTXO[];
  }
};

// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_sendRawTx",
//   "params": [
//     "123243546123243546feadc43546546123243546123243546feadc43546546123243546123243546feadc43546546123243546123243546feadc43546546",false
//   ],
//   "id": 1
// }
// jsonrpc Response
// {
//   "jsonrpc": "2.0",
//   "error": {
//     "code": 0,
//     "message": "ok",
//     "data": "23243546123243546feadc43546546123243546123243546"
//   },
//   "id": 1
// }
export const sendRawTx = async (
  rawData: string,
  allowHighFee: boolean,
): Promise<string> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  // const httpProvider = new ethers.providers.JsonRpcProvider();
  await provider.getNetwork();
  const params = [rawData, allowHighFee];
  const result = await provider.send('qng_sendRawTx', params);
  try {
    return result;
  } catch (error) {
    return '';
  }
};

// Get all UTXO collections that match the amount
export const qngGetTransferUtxos = async (
  from: string,
  amount: number,
): Promise<UTXO[]> => {
  if (amount <= 0) {
    return [] as UTXO[];
  }
  const utxos = await qngGetAvailableUtxos(from);
  // TODO utxo sort by amount ASC
  const res: UTXO[] = [];
  let leftAmount: number = amount;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < utxos.length; i++) {
    const utxo = utxos[i] as UTXO;
    if (utxo.amount >= leftAmount) {
      res.push(utxo);
      break;
    }
    res.push(utxo);
    leftAmount -= utxo.amount;
  }
  return res;
};

// normal transfer
export const qngTransferUtxo = async (
  from: string,
  to: string,
  amount: number,
  privKey: any,
): Promise<string> => {
  const needUtxos = await qngGetTransferUtxos(from, amount);
  const txsnr = txsign.newSigner(networks.testnet);
  txsnr.setTimestamp(parseInt(`${(new Date() as any) / 1000}`, 10));
  txsnr.setVersion(1);
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < needUtxos.length; i++) {
    const utxo = needUtxos[i] as UTXO;
    txsnr.addInput(utxo.txid, utxo.outputindex);
  }
  txsnr.addOutput(to, amount);
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < needUtxos.length; i++) {
    txsnr.sign(i, privKey);
  }
  // get raw Tx
  const rawTx = txsnr.build().toBuffer();
  return sendRawTx(rawTx, false);
};

// UTXO To EVM
export const transferUTXOToEvm = async (
  from: string,
  to: string,
  amount: number,
  privKey: any,
): Promise<string> => {
  const needUtxos = await qngGetTransferUtxos(from, amount);
  const txsnr = txsign.newSigner(networks.testnet);
  txsnr.setTimestamp(parseInt(`${(new Date() as any) / 1000}`, 10));
  txsnr.setVersion(1);
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < needUtxos.length; i++) {
    const utxo = needUtxos[i] as UTXO;
    txsnr.addInput(utxo.txid, utxo.outputindex);
  }
  txsnr.addOutput(to, amount);
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  // TODO need sign different type like qx
  for (let i = 0; i < needUtxos.length; i++) {
    txsnr.signExport(i, privKey);
    // txsnr.sign(i, privKey);
  }
  // get raw Tx
  const rawTx = txsnr.build().toBuffer();
  return sendRawTx(rawTx, false);
};

// EVM To UTXO
export const qngTransferEvmToUtxo = async (
  from: string,
  to: string,
  amount: number,
  privKey: any,
): Promise<string> => {
  const needUtxos = await qngGetTransferUtxos(from, amount);
  const txsnr = txsign.newSigner(networks.testnet);
  txsnr.setTimestamp(parseInt(`${(new Date() as any) / 1000}`, 10));
  txsnr.setVersion(1);
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < needUtxos.length; i++) {
    const utxo = needUtxos[i] as UTXO;
    txsnr.addInput(utxo.txid, utxo.outputindex);
  }
  txsnr.addOutput(to, amount);
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  // TODO need sign different type like qx
  for (let i = 0; i < needUtxos.length; i++) {
    txsnr.signImport(i, privKey);
  }
  // get raw Tx
  const rawTx = txsnr.build().toBuffer();
  return sendRawTx(rawTx, false);
};
