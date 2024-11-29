import { trimHexPrefix } from './utils';

export const handleSignStr = (sign: string): string => {
  const lastTwoChars = sign.slice(-2);
  let newStr = sign;
  // eth sign v is 27 or 28
  // golang sign v is 0 or 1
  if (lastTwoChars === '1b') {
    newStr = `${sign.slice(0, -2)}00`;
  }
  if (lastTwoChars === '1c') {
    newStr = `${sign.slice(0, -2)}01`;
  }
  return trimHexPrefix(newStr);
};
