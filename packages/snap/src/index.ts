import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { panel, text } from '@metamask/snaps-sdk';
import { ethers } from 'ethers';

import { getAbstractAccount } from './getAbstractAccount';
import { getBalance } from './getBalance';
import { getQngAddress, qngTransfer } from './qng';
import { transfer } from './transfer';
// export const changeNetwork = async () => {
//   await ethereum.request({
//     method: 'wallet_switchEthereumChain',
//     params: [{ chainId: '0x1fc3' }],
//   });
// };

export const getEoaAddress = async (): Promise<string> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0];
};

export const getAddress = async (): Promise<string> => {
  const aa = await getAbstractAccount();
  const address = await aa.getAccountAddress();
  return address;
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  console.log(request);
  // await changeNetwork();
  switch (request.method) {
    case 'connect_eoa':
      return await getEoaAddress();
    case 'connect_qng':
      return await getQngAddress();
    case 'balance_eoa':
      return await getBalance(await getEoaAddress());
    case 'connect':
      return await getAddress();
    case 'balance':
      return await getBalance(await getAddress());
    case 'transfer':
      // eslint-disable-next-line no-case-declarations
      const { target, ethValue } = request?.params as unknown as {
        [key: string]: string;
      };
      return await transfer(target as string, ethValue as string);
    case 'utxoTransfer':
      // eslint-disable-next-line no-case-declarations
      const { from, to, amount } = request?.params as unknown as {
        [key: string]: string;
      };
      return await qngTransfer(from as string, to as string, amount as string);
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
