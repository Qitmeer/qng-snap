/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable jsdoc/require-description */
import * as uint8arraytools from 'uint8array-tools';

// eslint-disable-next-line jsdoc/require-returns
/**
 *
 * @param arrays
 */
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
export const getMultiInputHash = (inp: string, fee: number): string => {
  const re = uint8arraytools.fromUtf8(inp);
  const re1 = new Uint8Array(8);
  uint8arraytools.writeUInt64(re1, 0, BigInt(fee), 'BE');
  return uint8arraytools.toHex(mergeUint8Arrays([re, re1]));
};
export const trimHexPrefix = (key: string) =>
  key.startsWith('0x') ? key.substring(2) : key;
