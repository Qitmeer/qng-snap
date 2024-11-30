import { ethers } from 'ethers';
import * as uint8arraytools from 'uint8array-tools';

import { qngUrl } from './config';

// ** server response header set "Access-Control-Allow-Origin": "null" **
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
const _qngSend = async (method: string, params: any): Promise<any> => {
  return _fetchJsonRequest(qngUrl(), method, params);
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
export const qngAddWatchAddr = async (addr: string): Promise<void> => {
  try {
    await _qngSend('qng_addBalance', [addr]);
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
  sign: any,
): Promise<string> => {
  try {
    const ret = await _qngSend('qng_checkUTXO', [txid, Number(idx), sign]);
    console.log('result', ret);
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
): Promise<string> => {
  try {
    const ret = await _qngSend('qng_calcUTXOSig', [txid, idx, priv]);
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
export const qngGetUTXOBalance = async (addr: string): Promise<string> => {
  // const provider = new ethers.providers.Web3Provider(ethereum as any);
  // await provider.getNetwork();
  // const httpProvider = new ethers.providers.JsonRpcProvider(RPC_API);
  // const params = [addr, 0];
  // const result = await httpProvider.send('qng_getBalance', params);
  await qngAddWatchAddr(addr);
  const ba = await _qngSend('qng_getBalance', [addr, 0]);
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
  len = 500,
): Promise<UTXO[]> => {
  await qngAddWatchAddr(addr);
  const params = [addr, len, false];
  const ret = await _qngSend('qng_getUTXOs', params);
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
): Promise<string> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  // const httpProvider = new ethers.providers.JsonRpcProvider();
  await provider.getNetwork();
  const params = [uint8arraytools.toHex(rawData), allowHighFee];
  try {
    const ret = await _qngSend('qng_sendRawTransaction', params);
    return ret as string;
  } catch (error) {
    console.log(error);
    return '';
  }
};
export const getQngBalanceByAddress = async (addr: string): Promise<string> => {
  const ba = await qngGetUTXOBalance(addr);
  return ba;
};
export const getUtxos = async (from: string, len = 500): Promise<[]> => {
  const utxos = await qngGetAvailableUtxos(from, len);
  if (!utxos) {
    return [];
  }
  if (utxos.length < 1) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return utxos as any;
};
