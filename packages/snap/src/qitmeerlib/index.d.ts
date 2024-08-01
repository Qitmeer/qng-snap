import { OPS } from './ops/ops.json';

type Module = {
  types: any;
  typecheck: any;
  hash: any;
  ec: any;
  qitmeer58check: any;
  address: any;
  networks: any;
  tx: any;
  txsign: any;
  block: any;
  OPS: any;
  OPS_MAP: any;
  script: any;
  signature: any;
};

const module: Module = {
  types: require('./types'),
  typecheck: require('./typecheck'),
  hash: require('./hash'),
  ec: require('./ec'),
  qitmeer58check: require('./qitmeer58check'),
  address: require('./address'),
  networks: require('./networks'),
  tx: require('./transaction'),
  txsign: require('./txsign'),
  block: require('./block'),
  OPS,
  OPS_MAP: require('./ops/map'),
  script: require('./script'),
  signature: require('./signature'),
};

export default module;
