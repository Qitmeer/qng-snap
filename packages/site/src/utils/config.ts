/* eslint-disable no-restricted-globals */
const RPC_URT = process.env.SNAP_ORIGIN ?? `https://127.0.0.1`;
export const bundlerUrl = (): string => {
  return `${RPC_URT}/bundler`;
};
export const qngUrl = (): string => {
  return `${RPC_URT}/qng`;
};
