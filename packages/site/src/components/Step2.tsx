import React, { useEffect, useState } from 'react';
import { useInvokeSnap } from '../hooks';
import { ReactComponent as FlaskFox } from '../assets/flask_fox.svg';
import styled from 'styled-components';
interface ComponentOneProps {
  enterStep: (num: number) => void; //
  _qngaddress: string;
  value: string;
}
const ButtonText = styled.span`
  margin-left: 1rem;
`;
const Step2Form: React.FC<ComponentOneProps> = ({
  enterStep,
  _qngaddress,
  value,
}) => {
  const [qngaddress, setQngAddress] = useState('');
  const [standardQngAddress, setStandardQngAddress] = useState('');
  const [qngBalance, setQngBalance] = useState('0');
  const [qngStandardBalance, setStandardQngBalance] = useState('0');
  if (_qngaddress) {
    setQngAddress(_qngaddress);
  }
  const invokeSnap = useInvokeSnap();
  useEffect(() => {
    const fetchDataAsync = async () => {
      setStandardQngAddress(
        (await invokeSnap({ method: 'connect_qng' })) as string,
      );
      setQngBalance(
        (await invokeSnap({
          method: 'balance_qng_address',
          params: { qngaddress },
        })) as string,
      );
      setStandardQngBalance(
        (await invokeSnap({ method: 'balance_qng' })) as string,
      );
    };
    if (qngaddress) {
      fetchDataAsync();
    }
  }, []);

  const handleConnectClick = async (): Promise<void> => {
    try {
      await invokeSnap({
        method: 'connect_eoa',
      });
      setStandardQngAddress(
        (await invokeSnap({ method: 'connect_qng' })) as string,
      );
      setStandardQngBalance(
        (await invokeSnap({ method: 'balance_qng' })) as string,
      );
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

    const [txid, idx, amount] = value?.split(':') as string[];
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
  const renderStep2 = () => {
    if (standardQngAddress) {
      return (
        <div>
          <p>
            <p>
              <label style={{ color: 'black', fontSize: '24px' }}>
                Standard Qng Address:{standardQngAddress}
              </label>
            </p>
            <p>
              <label style={{ color: 'black', fontSize: '24px' }}>
                Balance:
                {qngStandardBalance}
              </label>
            </p>
          </p>

          <button onClick={() => setStandardQngAddress('')}>Disconnect</button>
        </div>
      );
    }
    return (
      <div>
        <button onClick={handleConnectClick}>
          <FlaskFox />
          <ButtonText>Connect Standard Qng Account</ButtonText>
        </button>
      </div>
    );
  };

  return <div>{renderStep2()}</div>;
};

export default Step2Form;
