const createHash = require('create-hash');
const qitmeer = require('qitmeer-js');
const { Buffer } = require('safe-buffer');

const trimHexPrefix = (key: string) =>
  key.startsWith('0x') ? key.substring(2) : key;

export const getQngAddress = async () => {
  const privKey = qitmeer.ec.fromPrivateKey(
    // eslint-disable-next-line no-restricted-globals
    Buffer.from(
      trimHexPrefix(
        '6ab6806c0d8436ca32eb7c49c3993091b52e6f5f6aad1a7c9a8ddbfa07ea3194',
      ),
      'hex',
    ),
    {},
  );
  const txid =
    '5ee215d8d7597fcf97a40d02e9d0c38f3ac5a94fe598b2cc714c04201941add0';
  const target = 'TnE7iGEzwoRrnV43MDs91mP7oV62AntJ3TX';
  const amount = 11999980000;
  const pub = privKey.publicKey;
  console.log(pub.toString('hex'));
  // return pub.toString('hex');
  const h16 = await createHash('rmd160')
    .update(qitmeer.hash.blake2b256(pub))
    .digest('hex');
  console.log('-----------h16', h16);
  const addr = qitmeer.address.toBase58Check(
    Buffer.from(h16, 'hex'),
    qitmeer.networks.testnet.pubKeyHashAddrId,
  );
  console.log(addr);
  const txsnr = qitmeer.txsign.newSigner(qitmeer.networks.testnet);
  txsnr.setVersion(1);
  // alex's previous transaction output, has 450 qitmeer
  txsnr.addInput(txid, 0);
  txsnr.addOutput(target, Number(amount));
  // (in)45000000000 - (out)44990000000 = (miner fee)10000000

  // sign
  txsnr.sign(0, privKey);
  // get raw Tx
  const rawTx = txsnr.build().toBuffer();
  console.log(rawTx.toString('hex'));
  return rawTx;
};

getQngAddress().catch(function (ex: any) {
  console.log(ex);
});
