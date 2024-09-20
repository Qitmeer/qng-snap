// import { HttpRpcClient } from '@account-abstraction/sdk/dist/src/HttpRpcClient';
import { panel, text } from '@metamask/snaps-sdk';
import { ethers } from 'ethers';

import { getAbstractAccount, bundlerProvider } from './getAbstractAccount';

export const transfer = async (
  target: string,
  ethValue: string,
  chainId: number,
): Promise<string> => {
  const value = ethers.utils.parseEther(ethValue);
  const aa = await getAbstractAccount(chainId);
  const address = await aa.getAccountAddress();

  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        text(`Transfer from your Abstraction Account`),
        text(`from: ${address}  -  target: ${target}`),
        text(`alue: ${ethValue}`),
      ]),
    },
  });

  if (!result) {
    return '';
  }
  // const provider = new ethers.providers.Web3Provider(ethereum as any);
  const userOp = await aa.createSignedUserOp({
    target,
    value,
    data: '0x',
    // maxFeePerGas: 0x6507a5d0,
    // maxPriorityFeePerGas: 0x6507a5c0,
  });
  const bp = await bundlerProvider(chainId);
  const userOpHash = await bp.sendUserOpToBundler(userOp);
  const txid = await aa.getUserOpReceipt(userOpHash);
  console.log('reqId', userOpHash, 'txid=', txid);
  return userOpHash;
};
