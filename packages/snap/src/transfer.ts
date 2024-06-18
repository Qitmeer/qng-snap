// import { HttpRpcClient } from '@account-abstraction/sdk/dist/src/HttpRpcClient';
import { panel, text } from '@metamask/snaps-sdk';
import { ethers } from 'ethers';

import { getAbstractAccount } from './getAbstractAccount';

// const rpcUrl = 'http://127.0.0.1:3000/rpc';

export const transfer = async (
  target: string,
  ethValue: string,
): Promise<string> => {
  const value = ethers.utils.parseEther(ethValue);
  const aa = await getAbstractAccount();
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
  const op = await aa.createSignedUserOp({
    target,
    value,
    data: '0x',
    maxFeePerGas: 0x6507a5d0,
    maxPriorityFeePerGas: 0x6507a5c0,
  });
  return JSON.stringify(op);
  // const printedOp = await printOp(op);
  // console.log(`Signed UserOperation: ${printedOp}`);
  // const userOp = JSON.parse(printedOp);
  // console.log(userOp);
  // const snapVersion = 'AA';
  // let method = 'eth_sendUserOperation';
  // if (snapVersion === 'AA') {
  //   // userOp.factory = aa.factoryAddress;
  //   // userOp.factoryData = '0x' + userOp.initCode.substring(42);
  //   // userOp.initCode = null;
  // } else {
  //   // stackup
  //   method = 'Eth_sendUserOperation';
  // }
  // const body = JSON.stringify({
  //   method,
  //   id: 1,
  //   jsonrpc: '2.0',
  //   params: [userOp, aa.entryPointAddress],
  // });
  // const response = await fetch(rpcUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body,
  // });
  // const { uoHash } = await response.json();
  // console.log(uoHash);
  // return uoHash;

  // Send the user operation
  // const provider = new ethers.providers.Web3Provider(ethereum as any);
  // const chainId = await provider.getNetwork().then((net) => net.chainId);
  // const client = new HttpRpcClient(rpcUrl, aa.entryPointAddress, chainId);
  // const userOpHash = await client.sendUserOpToBundler(op);

  // console.log('Waiting for transaction...');
  // const transactionHash = (await aa.getUserOpReceipt(userOpHash)) as string;
  // console.log(`Transaction hash: ${transactionHash}`);
  // return transactionHash;
};
