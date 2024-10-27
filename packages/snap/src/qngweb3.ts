import { ethers } from 'ethers';
import { TxSigner as txsign, networks } from 'qitmeerts';
import * as uint8arraytools from 'uint8array-tools';

import { qngUrl, crossQngUrl } from './getAbstractAccount';

// ** server response header set "Access-Control-Allow-Origin": "null" **

export const trimHexPrefix = (key: string) =>
  key.startsWith('0x') ? key.substring(2) : key;

const _fetchJsonRequest = async (
  url: string,
  method: string,
  params: any,
): Promise<any> => {
  const body = {
    jsonrpc: '2.0',
    method,
    params,
    id: 1,
  };
  const re = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await re.json();
  try {
    return result.result;
  } catch (error) {
    return '';
  }
};
const _qngSend = async (
  method: string,
  params: any,
  chainId: number,
): Promise<any> => {
  return _fetchJsonRequest(qngUrl(chainId), method, params);
};
const _qngCrossSend = async (
  method: string,
  params: any,
  chainId: number,
): Promise<any> => {
  return _fetchJsonRequest(crossQngUrl(chainId), method, params);
};
// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_addBalance",
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
//     "result": null
//   },
//   "id": 1
// }
export const qngAddWatchAddr = async (
  addr: string,
  chainId: number,
): Promise<void> => {
  try {
    await _qngSend('qng_addBalance', [addr], chainId);
  } catch (error) {
    console.log(error);
  }
};

// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_checkUTXO",
//   "params": [
//     "0000ffff...",0,"1000eeedddfff..."
//   ],
//   "id": 1
// }
// jsonrpc Response
// {
//   "jsonrpc": "2.0",
//   "error": {
//     "code": 0,
//     "message": "ok",
//     "result": "0000ffff..."
//   },
//   "id": 1
// }
export const qngCheckUTXO = async (
  txid: string,
  idx: number,
  sig: string,
  chainId: number,
): Promise<string> => {
  try {
    const ret = await _qngSend('qng_checkUTXO', [txid, idx * 1, sig], chainId);
    return ret;
  } catch (error) {
    console.log(error);
  }
  return '';
};

// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_calcUTXOSig",
//   "params": [
//     "0000ffff...",0,"1000eeedddfff..."
//   ],
//   "id": 1
// }
// jsonrpc Response
// {
//   "jsonrpc": "2.0",
//   "error": {
//     "code": 0,
//     "message": "ok",
//     "result": null
//   },
//   "id": 1
// }
export const qngCalcUTXOSig = async (
  txid: string,
  idx: number,
  priv: string,
  chainId: number,
): Promise<string> => {
  try {
    const ret = await _qngSend('qng_calcUTXOSig', [txid, idx, priv], chainId);
    return ret;
  } catch (error) {
    console.log(error);
  }
  return '';
};

// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_getBalance",
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
//     "result": 100000000
//   },
//   "id": 1
// }
export const qngGetUTXOBalance = async (
  addr: string,
  chainId: number,
): Promise<string> => {
  // const provider = new ethers.providers.Web3Provider(ethereum as any);
  // await provider.getNetwork();
  // const httpProvider = new ethers.providers.JsonRpcProvider(RPC_API);
  // const params = [addr, 0];
  // const result = await httpProvider.send('qng_getBalance', params);
  await qngAddWatchAddr(addr, chainId);
  const ba = await _qngSend('qng_getBalance', [addr, 0], chainId);
  try {
    return (ba as number).toString();
  } catch (error: any) {
    console.log(error);
    return error.message as string;
  }
};

type UTXO = {
  type: string;
  amount: number;
  txid: string;
  idx: number;
  status: string;
};

// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_getUTXOs",
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
//     "result": [{"txid":"13243545abcd232432545...","idx":1,"amount":10000000000},{"txid":"e123243545abcd23243254568...","idx":3,"amount":20000000000}]
//   },
//   "id": 1
// }
export const qngGetAvailableUtxos = async (
  addr: string,
  chainId: number,
): Promise<UTXO[]> => {
  await qngAddWatchAddr(addr, chainId);
  const params = [addr, 10000, false];
  const ret = await _qngSend('qng_getUTXOs', params, chainId);
  try {
    return ret as UTXO[];
  } catch (error) {
    console.log(error);
    return [];
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
//     "result": "23243546123243546feadc43546546123243546123243546"
//   },
//   "id": 1
// }
export const sendRawTx = async (
  rawData: Uint8Array,
  allowHighFee: boolean,
  chainId: number,
): Promise<string> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  // const httpProvider = new ethers.providers.JsonRpcProvider();
  await provider.getNetwork();
  const params = [uint8arraytools.toHex(rawData), allowHighFee];
  try {
    const ret = await _qngSend('qng_sendRawTransaction', params, chainId);
    return ret as string;
  } catch (error) {
    console.log(error);
    return '';
  }
};

// jsonrpc Request
// {
//   "jsonrpc": "2.0",
//   "method": "qng_crossSend",
//   "params": [
//     "123243546123243546feadc435465461232435461232435",0,10000,"2324356786779feab43677"
//   ],
//   "id": 1
// }
// jsonrpc Response
// {
//   "jsonrpc": "2.0",
//   "error": {
//     "code": 0,
//     "message": "ok",
//     "result": "23243546123243546feadc43546546123243546123243546"
//   },
//   "id": 1
// }
export const crossSendtoBunder = async (
  txid: string,
  idx: number,
  fee: number,
  sign: string,
  chainId: number,
): Promise<string> => {
  const params = [txid, idx, fee, sign];
  try {
    const ret = await _qngCrossSend('qng_crossSend', params, chainId);
    return ret as string;
  } catch (error) {
    console.log(error);
    return '';
  }
};

// Get all UTXO collections that match the amount
export const qngGetTransferUtxos = async (
  from: string,
  amount: number,
  chainId: number,
): Promise<UTXO[]> => {
  if (amount <= 0) {
    return [] as UTXO[];
  }
  const utxos = await qngGetAvailableUtxos(from, chainId);
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
  chainId: number,
): Promise<string> => {
  const fee = 10000;
  let leftAmount: number = amount + fee;
  const needUtxos = await qngGetTransferUtxos(from, leftAmount, chainId);
  const txsnr = txsign.newSigner(networks.privnet);
  txsnr.setTimestamp(parseInt(`${(new Date() as any) / 1000}`, 10));
  txsnr.setVersion(1);
  let allInputAmount = 0;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < needUtxos.length; i++) {
    const utxo = needUtxos[i] as UTXO;
    txsnr.addInput(utxo.txid, utxo.idx);
    allInputAmount += utxo.amount;
  }
  txsnr.addOutput(to, amount);
  leftAmount = allInputAmount - amount - fee;
  if (leftAmount > 0) {
    txsnr.addOutput(from, leftAmount);
  }
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < needUtxos.length; i++) {
    txsnr.sign(i, privKey);
  }
  // get raw Tx
  const rawTx = txsnr.build().toBuffer();
  return sendRawTx(rawTx, false, chainId);
};
export const getMultiInputHash = (inp: string, fee: number): string => {
  let re = uint8arraytools.fromUtf8(inp);
  let re1 = new Uint8Array(8);
  uint8arraytools.writeUInt64(re1, 0, BigInt(fee), 'BE');
  return uint8arraytools.toHex(mergeUint8Arrays([re, re1]));
};

function mergeUint8Arrays(arrays: any[]) {
  const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);

  const mergedArray = new Uint8Array(totalLength);

  let offset = 0;
  arrays.forEach((array) => {
    mergedArray.set(array, offset);
    offset += array.length;
  });

  return mergedArray;
}

export const getInputHash = (
  txid: string,
  idx: number,
  fee?: number,
): Uint8Array => {
  let re = new Uint8Array(36);
  if (fee) {
    re = new Uint8Array(44);
  }
  const constTxId: Uint8Array = uint8arraytools.fromHex(txid);
  re.set(constTxId.reverse(), 0);
  uint8arraytools.writeUInt32(re, 32, idx, 'BE');
  if (fee) {
    uint8arraytools.writeUInt64(re, 36, BigInt(fee), 'BE');
  }
  return re;
};

export const handleSignStr = (sign: string): string => {
  const lastTwoChars = sign.slice(-2);
  let newStr = sign;
  // eth sign v is 27 or 28
  // golang sign v is 0 or 1
  if (lastTwoChars === '1b') {
    newStr = `${sign.slice(0, -2)}00`;
  }
  if (lastTwoChars === '1c') {
    newStr = `${sign.slice(0, -2)}01`;
  }
  return trimHexPrefix(newStr);
};

// UTXO To EVM
export const transferUTXOToEvmWithEthSign = async (
  txid: string,
  idx: number,
  fee: number,
  chainId: number,
): Promise<string> => {
  const ret = uint8arraytools.toHex(getInputHash(txid, idx, fee));

  const provider = new ethers.providers.Web3Provider(ethereum as any);
  // auth user
  const accounts = await provider.send('eth_requestAccounts', []);
  const sign = (await ethereum.request({
    method: 'personal_sign',
    params: [ret, accounts[0]],
  })) as string;
  // const txhash = crossSendtoBunder(
  //   txid,
  //   idx,
  //   fee,
  //   handleSignStr(sign),
  //   chainId,
  // );
  return sign;
};
