/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable id-denylist */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { SetStateAction, useState } from 'react';
import styled from 'styled-components';

import { ReactComponent as FlaskFox } from '../assets/flask_fox.svg';
import { useInvokeSnap } from '../hooks';
import { getBalance } from '../utils';
import { getAbstractAccount } from '../utils/aa';

const ButtonText = styled.span`
  margin-left: 1rem;
`;
const StyledButton = styled.button`
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px 20px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: white;
    background-color: darkblue;
  }
`;
type ComponentOneProps = {
  enterStep: (num: number) => void; //
};

const Step3Form: React.FC<ComponentOneProps> = ({ enterStep }) => {
  const [eoaAddress, setEOAAddress] = useState('');
  const [eoaBalance, setEOABalance] = useState('0');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');

  const invokeSnap = useInvokeSnap();
  const handleConnectAAClick = async (): Promise<void> => {
    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_accounts',
      })) as string[];
      const from = accounts[0] as string;
      setEOAAddress(window.ethereum.selectedAddress as string);
      setEOABalance(await getBalance(from));
      const aa = await getAbstractAccount();
      const aaaddr = await aa.getAccountAddress();
      setAddress(aaaddr);
      setBalance(await getBalance(aaaddr));
    } catch (er) {
      console.error(er);
    }
  };
  const renderStep3 = () => {
    if (address) {
      return (
        <div>
          <p>
            <label style={{ color: 'black', fontSize: '24px' }}>
              Connected EOA Address:{eoaAddress}{' '}
            </label>{' '}
          </p>
          <p>
            <label style={{ color: 'black', fontSize: '24px' }}>
              Balance :{eoaBalance}
            </label>
          </p>
          <p>
            <label style={{ color: 'black', fontSize: '24px' }}>
              AA Address:{address}
            </label>{' '}
          </p>
          <p>
            <label style={{ color: 'black', fontSize: '24px' }}>
              Balance :{balance}
            </label>
          </p>

          <StyledButton onClick={() => setAddress('')}>Disconnect</StyledButton>
        </div>
      );
    }
    return (
      <div>
        <StyledButton onClick={handleConnectAAClick}>
          <FlaskFox />
          <ButtonText>Connect AA Account</ButtonText>
        </StyledButton>
      </div>
    );
  };

  return <div>{renderStep3()}</div>;
};

export default Step3Form;
