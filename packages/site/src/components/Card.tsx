/* eslint-disable @typescript-eslint/no-misused-promises */
// import { Buffer } from 'buffer';
// import { hash, hash160 } from 'qitmeer-js';
import { useState } from 'react';
import { Select } from 'antd';
const { Option } = Select;

import type { ReactNode, SetStateAction } from 'react';
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
  const [qngBalance, setQngBalance] = useState('');
  const [target, setTarget] = useState('');
  const [targetQng, setTargetQng] = useState('');
  const [txide, setTxid] = useState('');
  const [idx, setIdx] = useState('');
  const [fee, setFee] = useState('10000');
  const [oneUtxo, setOneUtxo] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [value, setValue] = useState('select');
  // const options = [
  //   {
  //     value: 'select',
  //     label: 'select',
  //   },
  // ];
  const [options, setOptions] = useState([
    {
      value: 'select',
      label: 'select',
    },
  ]);
  const handleConnectAAClick = async (): Promise<void> => {
    try {
      setEOAAddress((await invokeSnap({ method: 'connect_eoa' })) as string);
      setEOABalance((await invokeSnap({ method: 'balance_eoa' })) as string);
      setAddress((await invokeSnap({ method: 'connect' })) as string);
      setQngAddress((await invokeSnap({ method: 'connect_qng' })) as string);
      setBalance((await invokeSnap({ method: 'balance' })) as string);
      setQngBalance((await invokeSnap({ method: 'balance_qng' })) as string);
      setOneUtxo(
        (await invokeSnap({
          method: 'getOneUtxo',
          params: { utxoFrom: qngAddress },
        })) as string,
      );
    } catch (er) {
      console.error(er);
    }
  };

  const handleReloadBalancesClick = async () => {
    try {
      setEOABalance((await invokeSnap({ method: 'balance_eoa' })) as string);
      setBalance((await invokeSnap({ method: 'balance' })) as string);
      setQngBalance((await invokeSnap({ method: 'balance_qng' })) as string);
      setOneUtxo(
        (await invokeSnap({
          method: 'getOneUtxo',
          params: { utxoFrom: qngAddress },
        })) as string,
      );
    } catch (er) {
      console.error(er);
    }
  };

  const handleTargetChange = (ev: React.FocusEvent<HTMLInputElement>) => {
    setTarget(ev.currentTarget.value);
  };
  const handleTargetQngChange = (ev: React.FocusEvent<HTMLInputElement>) => {
    setTargetQng(ev.currentTarget.value);
  };
  const handleEthAmountChange = (ev: React.FocusEvent<HTMLInputElement>) => {
    setEthAmount(ev.currentTarget.value);
  };

  const handleTxidChange = (ev: React.FocusEvent<HTMLInputElement>) => {
    setTxid(ev.currentTarget.value);
  };

  const handleIdxChange = (ev: React.FocusEvent<HTMLInputElement>) => {
    setIdx(ev.currentTarget.value);
  };

  const handleFeeChange = (ev: React.FocusEvent<HTMLInputElement>) => {
    setFee(ev.currentTarget.value);
  };
  const handleCheckQngBalanceClick = async () => {
    if (!targetQng) {
      // eslint-disable-next-line no-alert
      alert('enter target qng address.');
      return;
    }

    try {
      const ba = (await invokeSnap({
        method: 'balance_qng_address',
        params: {
          qngaddress: targetQng,
        },
      })) as number;
      if (ba * 1 > 0) {
        // eslint-disable-next-line no-alert
        alert(`Find Utxos , balance is ${ba}`);
        const utxos = (await invokeSnap({
          method: 'get50Utxos',
          params: { qngaddr: targetQng },
        })) as [];
        console.log(utxos);
        const newOptions = [
          {
            value: 'select',
            label: 'select',
          },
        ]; // 创建新数组
        for (let i = 0; i < utxos.length; i += 1) {
          let last = utxos[i] as any;
          let v = `${last?.txid}:${last?.idx}:${last?.amount}`;
          newOptions.push({ label: v, value: v });
          setOptions(newOptions);
          console.log(options);
        }
        return;
      }
      // eslint-disable-next-line no-alert
      alert(`please wait a moment to check`);
    } catch (er) {
      console.error(er);
    }
  };
  const handleUtxoToEvmFromTargetQngClick = async () => {
    if (value == '' || value == 'select') {
      // eslint-disable-next-line no-alert
      alert('please select a utxo.');
      return;
    }

    const [txid, idx, amount] = value.split(':');
    const withWallet = false;
    try {
      const res = (await invokeSnap({
        method: 'export',
        params: {
          txid,
          idx,
          fee: 10000,
          withWallet,
        },
      })) as string;
      // eslint-disable-next-line no-alert
      alert(`sign succ ${res}`);
      console.log(res);
    } catch (er) {
      console.error(er);
    }
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
      const txid = (await invokeSnap({
        method: 'utxoTransfer',
        params: {
          from: qngAddress,
          to: target,
          amount: ethValue,
        },
      })) as string;
      // eslint-disable-next-line no-alert
      alert(`tx sign succ`);
      console.log(txid);
    } catch (er) {
      console.error(er);
    }
  };

  const handleUtxoToEvmClick = async () => {
    if (!txide || !idx) {
      // eslint-disable-next-line no-alert
      alert('enter txid and idx and fee.');
      return;
    }

    const withWallet = false;
    try {
      const res = (await invokeSnap({
        method: 'export',
        params: {
          txid: txide,
          idx,
          fee,
          withWallet,
        },
      })) as string;
      // eslint-disable-next-line no-alert
      alert(`sign succ ${res}`);
      console.log(res);
    } catch (er) {
      console.error(er);
    }
  };

  const handleUtxoToEvmWithWalletClick = async () => {
    if (!txide || !idx) {
      // eslint-disable-next-line no-alert
      alert('enter txid and idx and fee.');
      return;
    }
    const withWallet = true;
    try {
      const res = (await invokeSnap({
        method: 'export',
        params: {
          txid: txide,
          idx,
          fee,
          withWallet,
        },
      })) as string;
      // eslint-disable-next-line no-alert
      alert(`sign succ ${res}`);
      console.log(res);
    } catch (er) {
      console.error(er);
    }
  };

  const handleChange = (value: SetStateAction<string>) => {
    console.log(`selected ${value}`);
    setValue(value);
  };

  return (
    <>
      {/* {!address && (
        <CardWrapper fullWidth={true} disabled={false}>
          <Center>
            <Button onClick={handleConnectAAClick}>
              Connect Abstract Account
            </Button>
          </Center>
        </CardWrapper>
      )} */}
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
            <Title>Your Standard Qng Account 🎉</Title>
            <AAText>P2KH Address: {qngAddress}</AAText>
            <AAText>Balance: {qngBalance}</AAText>
          </CardWrapper>
          <CardWrapper fullWidth={true} disabled={false}>
            <Button onClick={handleReloadBalancesClick}>Reload Balances</Button>
          </CardWrapper>
          <CardWrapper fullWidth={true} disabled={false}>
            <Title>Import Origin Wallet Utxos</Title>
            <div>
              <TargetInput
                type="text"
                placeholder="origin wallet qng address (Tn....)"
                onChange={handleTargetQngChange}
              />
            </div>
            <Spacer />
            <Button onClick={handleCheckQngBalanceClick}>Check balance</Button>
            <Title>AvailableUtxos</Title>
            <Select
              defaultValue="select"
              style={{ width: 600 }}
              onChange={handleChange}
            >
              {options.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Button onClick={handleUtxoToEvmFromTargetQngClick}>
              Transfer from UTXO to EVM with {eoaAddress}
            </Button>
          </CardWrapper>

          {/* <CardWrapper fullWidth={true} disabled={false}>
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
          </CardWrapper> */}

          <CardWrapper fullWidth={true} disabled={false}>
            <Title>Transfer from Standard Qng Account</Title>
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

          <CardWrapper fullWidth={true} disabled={false}>
            <Title>Transfer from Qng Account</Title>
            <div>
              <TargetInput
                type="text"
                placeholder="txid"
                onChange={handleTxidChange}
              />
              <AmountInput
                type="number"
                placeholder="idx"
                onChange={handleIdxChange}
              />
              <AmountInput
                type="number"
                placeholder="fee"
                onChange={handleFeeChange}
              />
            </div>
            <Title>Available UTXO of the Standard Qng Addr</Title>
            <AAText> {oneUtxo} </AAText>
            <Spacer />
            <Button onClick={handleUtxoToEvmClick}>
              Transfer from UTXO to EVM with {eoaAddress}
            </Button>
            <Spacer />
            <Button onClick={handleUtxoToEvmWithWalletClick}>
              Transfer from UTXO to EVM with {qngAddress}
            </Button>
          </CardWrapper>
        </>
      )}
    </>
  );
};
