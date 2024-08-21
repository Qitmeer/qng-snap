import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { panel, text } from '@metamask/snaps-sdk';
import { ethers } from 'ethers';

import { getAbstractAccount } from './getAbstractAccount';
import { getBalance } from './getBalance';
import {
  getQngAddress,
  qngTransfer,
  getQngBalance,
  ethSign,
  walletSign,
  getOneUtxo,
} from './qng';
import { transfer } from './transfer';

export const getChainId = async (): Promise<number> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  const network = await provider.getNetwork();
  return network.chainId;
};
export const getEoaAddress = async (): Promise<string> => {
  const provider = new ethers.providers.Web3Provider(ethereum as any);
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0];
};

export const getAddress = async (chainId: number): Promise<string> => {
  const aa = await getAbstractAccount(chainId);
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
  const chainId = await getChainId();
  switch (request.method) {
    case 'connect_eoa':
      return await getEoaAddress();
    case 'connect_qng':
      return await getQngAddress(chainId);
    case 'balance_eoa':
      return await getBalance(await getEoaAddress());
    case 'balance_qng':
      return await getQngBalance(chainId);
    case 'connect':
      return await getAddress(chainId);
    case 'balance':
      return await getBalance(await getAddress(chainId));
    case 'transfer':
      // eslint-disable-next-line no-case-declarations
      const { target, ethValue } = request?.params as unknown as {
        [key: string]: string;
      };
      return await transfer(target as string, ethValue as string, chainId);
    case 'utxoTransfer':
      // eslint-disable-next-line no-case-declarations
      const { from, to, amount } = request?.params as unknown as {
        [key: string]: string;
      };
      return await qngTransfer(
        from as string,
        to as string,
        amount as string,
        chainId,
      );
    case 'export':
      // eslint-disable-next-line no-case-declarations
      const { txid, idx, fee, withWallet } = request?.params as unknown as {
        [key: string]: any;
      };
      if (!withWallet) {
        return await ethSign(
          txid as string,
          idx as number,
          fee as number,
          chainId,
        );
      }
      // eslint-disable-next-line no-case-declarations
      const res = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`sign with 813 wallet`),
            // eslint-disable-next-line no-template-curly-in-string, @typescript-eslint/restrict-template-expressions
            text(`Sign Content\n txid:${txid} \nidx:${idx} \nfee:${fee}`),
            text('Please Check the fee!'),
          ]),
        },
      });
      if (!res) {
        return '';
      }
      return walletSign(txid as string, idx as number, fee as number, chainId);
    case 'getOneUtxo':
      // eslint-disable-next-line no-case-declarations
      const { utxoFrom } = request?.params as unknown as {
        [key: string]: string;
      };
      return getOneUtxo(utxoFrom as string, chainId);
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
