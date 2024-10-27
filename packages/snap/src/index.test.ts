/* eslint-disable @typescript-eslint/unbound-method */
// eslint-disable-next-line @typescript-eslint/no-shadow

import * as uint8arraytools from 'uint8array-tools';

import { getInputHash } from './qngweb3';

describe('onRpcRequest', () => {
  it('test input hash', async () => {
    const ret = getInputHash(
      'c9b3b1bdc5c500dae7bcac5fdf9aa5099b856dc6c69fa8b526eb6042795229e1',
      0,
    );

    console.log(uint8arraytools.toHex(ret), ret);
  });
});
