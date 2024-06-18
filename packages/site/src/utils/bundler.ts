const rpcUrl = 'http://127.0.0.1:3000/rpc';

// eslint-disable-next-line jsdoc/require-jsdoc
export async function sendUserOpToBundler(body: string) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
  const { uoHash } = await response.json();
  console.log(uoHash);
}
