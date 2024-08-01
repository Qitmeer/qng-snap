// import { Buffer } from 'buffer';
// import { hash, hash160 } from 'qitmeer-js';
import { useState } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';

import { useInvokeSnap } from '../hooks';

type CardProps = {
  content: {
    title?: string;
    description: ReactNode;
    button?: ReactNode;
  };
  disabled?: boolean;
  fullWidth?: boolean;
};

const CardWrapper = styled.div<{
  fullWidth?: boolean | undefined;
  disabled?: boolean | undefined;
}>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : '250px')};
  background-color: ${({ theme }) => theme.colors.card?.default};
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
  padding: 2.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const Description = styled.div`
  margin-top: 2.4rem;
  margin-bottom: 2.4rem;
`;
const TargetInput = styled.input`
  margin-top: 10px;
  font-size: 18px;
  width: 100%;
`;

const AmountInput = styled.input`
  margin-top: 10px;
  font-size: 18px;
  width: 100%;
`;

const AAText = styled.div`
  margin-bottom: 1.2rem;
`;

const Spacer = styled.div`
  margin-top: 20px;
`;

const Center = styled.div`
  text-align: center;
`;

const Button = styled.button`
  align-items: center;
  justify-content: center;
  margin-top: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

export const Card = ({ content, disabled = false, fullWidth }: CardProps) => {
  const { title, description, button } = content;
  return (
    <CardWrapper fullWidth={fullWidth} disabled={disabled}>
      {title && <Title>{title}</Title>}
      <Description>{description}</Description>
      {button}
    </CardWrapper>
  );
};

export const AACard = () => {
  const invokeSnap = useInvokeSnap();
  const [eoaAddress, setEOAAddress] = useState('');
  const [eoaBalance, setEOABalance] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [qngAddress, setQngAddress] = useState('');
  const [target, setTarget] = useState('');
  const [ethAmount, setEthAmount] = useState('');

  // const Hash160 = (pubHex: string): string => {
  //   const h16 = hash.hash160(pubHex);
  //   return h16.toString('hex');
  // };

  const handleConnectAAClick = async () => {
    try {
      setEOAAddress((await invokeSnap({ method: 'connect_eoa' })) as string);
      setEOABalance((await invokeSnap({ method: 'balance_eoa' })) as string);
      setAddress((await invokeSnap({ method: 'connect' })) as string);
      setQngAddress((await invokeSnap({ method: 'connect_qng' })) as string);
      setBalance((await invokeSnap({ method: 'balance' })) as string);
    } catch (er) {
      console.error(er);
    }
  };

  const handleReloadBalancesClick = async () => {
    try {
      setEOABalance((await invokeSnap({ method: 'balance_eoa' })) as string);
      setBalance((await invokeSnap({ method: 'balance' })) as string);
    } catch (er) {
      console.error(er);
    }
  };

  const handleTargetChange = (ev: React.FocusEvent<HTMLInputElement>) => {
    setTarget(ev.currentTarget.value);
  };

  const handleEthAmountChange = (ev: React.FocusEvent<HTMLInputElement>) => {
    setEthAmount(ev.currentTarget.value);
  };

  const handleTransferFromAAClick = async () => {
    if (!target || !ethAmount) {
      // eslint-disable-next-line no-alert
      alert('enter target and amount.');
      return;
    }

    try {
      const ethValue = `${ethAmount}`;
      const userOpHash = (await invokeSnap({
        method: 'transfer',
        params: {
          target,
          ethValue,
        },
      })) as string;
      console.log(`tx has been sent!: userOpHash ${userOpHash}`);
      // eslint-disable-next-line no-alert
      alert(`tx has been sent!: userOpHash`);
    } catch (er) {
      console.error(er);
    }
  };

  const handleTransferFromQngClick = async () => {
    if (!target || !ethAmount) {
      // eslint-disable-next-line no-alert
      alert('enter txid and target and amount.');
      return;
    }

    try {
      const ethValue = `${ethAmount}`;
      const rawTx = (await invokeSnap({
        method: 'utxoTransfer',
        params: {
          from: qngAddress,
          to: target,
          amount: ethValue,
        },
      })) as string;
      // eslint-disable-next-line no-alert
      alert(`tx sign succ`);
      console.log(rawTx);
    } catch (er) {
      console.error(er);
    }
  };

  return (
    <>
      {!address && (
        <CardWrapper fullWidth={true} disabled={false}>
          <Center>
            <Button onClick={handleConnectAAClick}>
              Connect Abstract Account
            </Button>
          </Center>
        </CardWrapper>
      )}
      {address && (
        <>
          <CardWrapper fullWidth={true} disabled={false}>
            <Title>Your EOA Account </Title>
            <AAText>Address: {eoaAddress}</AAText>
            <AAText>Balance: {eoaBalance}</AAText>
          </CardWrapper>
          <CardWrapper fullWidth={true} disabled={false}>
            <Title>Your Abstract Account 🎉</Title>
            <AAText>Address: {address}</AAText>
            <AAText>Balance: {balance}</AAText>
          </CardWrapper>
          <CardWrapper fullWidth={true} disabled={false}>
            <Title>Your Qng Account 🎉</Title>
            <AAText>P2KH Address: {qngAddress}</AAText>
          </CardWrapper>
          <CardWrapper fullWidth={true} disabled={false}>
            <Button onClick={handleReloadBalancesClick}>Reload Balances</Button>
          </CardWrapper>
          <CardWrapper fullWidth={true} disabled={false}>
            <Title>Transfer from Abstract Account</Title>
            <div>
              <TargetInput
                type="text"
                placeholder="Target"
                onChange={handleTargetChange}
              />
              <AmountInput
                type="number"
                placeholder="Amount"
                onChange={handleEthAmountChange}
              />
            </div>
            <Spacer />
            <Button onClick={handleTransferFromAAClick}>
              Transfer from AA
            </Button>
          </CardWrapper>

          <CardWrapper fullWidth={true} disabled={false}>
            <Title>Transfer from Qng Account</Title>
            <div>
              <TargetInput
                type="text"
                placeholder="Target"
                onChange={handleTargetChange}
              />
              <AmountInput
                type="number"
                placeholder="Amount"
                onChange={handleEthAmountChange}
              />
            </div>
            <Spacer />
            <Button onClick={handleTransferFromQngClick}>
              Transfer from UTXO
            </Button>
          </CardWrapper>
        </>
      )}
    </>
  );
};
