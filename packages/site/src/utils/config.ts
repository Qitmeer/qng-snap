const RPC_URT = `http://127.0.0.1:8081`;
export const bundlerUrl = (): string => {
  return `${RPC_URT}/bundler`;
};
export const qngUrl = (): string => {
  return `${RPC_URT}/qng`;
};
