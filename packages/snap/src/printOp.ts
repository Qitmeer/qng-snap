import type { UserOperationStruct } from '@account-abstraction/contracts';
import { ethers } from 'ethers';

// eslint-disable-next-line jsdoc/require-jsdoc
export async function printOp(op: UserOperationStruct): Promise<string> {
  return ethers.utils
    .resolveProperties(op)
    .then((userOp) =>
      Object.keys(userOp)
        .map((key) => {
          let val = (userOp as any)[key];
          if (typeof val !== 'string' || !val.startsWith('0x')) {
            if (val !== undefined) {
              val = ethers.utils.hexValue(val);
            }
          }
          return [key, val];
        })
        .reduce(
          (set, [k, val]) => ({
            ...set,
            [k]: val,
          }),
          {},
        ),
    )
    .then((userOp) => JSON.stringify(userOp, null, 2));
}
