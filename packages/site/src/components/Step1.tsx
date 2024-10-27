/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable id-length */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-negated-condition */
/* eslint-disable id-denylist */
import { Select, Modal } from 'antd';
import { ethers } from 'ethers';
import React, { SetStateAction, useState } from 'react';
import styled from 'styled-components';
import * as uint8arraytools from 'uint8array-tools';

import { ReactComponent as FlaskFox } from '../assets/flask_fox.svg';
import { useInvokeSnap } from '../hooks';
import { getBalance } from '../utils';
import { checkTxIdSig, sendToBundler } from '../utils/aa';
import { getQngBalanceByAddress, getUtxos } from '../utils/qng';
import { getMultiInputHash, getInputHash } from '../utils/utils';

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
const ButtonText = styled.span`
  margin-left: 1rem;
`;
const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 2px solid #ccc;
  font-size: 16px;
  width: 100%;
  outline: none;
  transition: border-color 0.3s ease-in-out;

  &:focus {
    border-color: #4caf50;
  }
`;

const { Option } = Select;
type ComponentOneProps = {
  enterStep: (num: number) => void; //
};
const Step1Form: React.FC<ComponentOneProps> = () => {
  const [eoaaddress, setEoaAddress] = useState('');
  const [qngaddress, setQngAddress] = useState('');
  const [eoaBalance, setEOABalance] = useState('0');
  const [qngBalance, setQngBalance] = useState('0');
  const [selectedOptions, setSelectedOptions] = useState([] as string[]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    isSuccess: false,
  });

  const [options, setOptions] = useState([
    {
      value: 'select',
      label: 'select the utxo',
    },
  ]);
  const invokeSnap = useInvokeSnap();
  const showSuccess = (msg: string) => {
    setModalContent({
      title: 'success',
      message: msg,
      isSuccess: true,
    });
    setIsModalVisible(true);
  };

  const showError = (msg: string) => {
    setModalContent({
      title: 'failed',
      message: msg,
      isSuccess: false,
    });
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const handleSelectChange = (values: React.SetStateAction<string[]>) => {
    console.log(`selected ${values}`);
    setSelectedOptions(values);
  };
  const handleUtxoToEvmFromTargetQngClick = async () => {
    let ops = '';
    if (selectedOptions.length <= 0) {
      // all
      // eslint-disable-next-line no-alert
      for (let i = 1; i < options.length; i++) {
        const arr = options[i]?.value.split(':') as any[];
        const txid = arr[0] as string;
        const idx = arr[1] as number;
        ops = `${ops + txid}:${idx},`;
      }
    } else {
      for (let i = 0; i < selectedOptions.length; i++) {
        const arr = selectedOptions[i]?.split(':') as any[];
        const txid = arr[0] as string;
        const idx = arr[1] as number;
        ops = `${ops + txid}:${idx},`;
      }
    }
    setIsDisabled(true);
    ops = ops.substring(0, ops.length - 1);
    console.log(ops);
    const fee = 10000 * selectedOptions.length;
    const inp = getMultiInputHash(ops, fee);
    console.log(inp, window.ethereum.selectedAddress);
    const sign = (await window.ethereum.request({
      method: 'personal_sign',
      params: [`0x${inp}`, window.ethereum.selectedAddress],
    })) as string;
    try {
      const res = await sendToBundler(ops, fee, sign);
      let ba = (await getQngBalanceByAddress(qngaddress)) as unknown as number;
      ba /= 1e8;
      setQngBalance(ba.toString());
      setEOABalance(
        await getBalance(window.ethereum.selectedAddress as string),
      );
      showSuccess(`send success,txid:${res}`);
      console.log(res);
    } catch (er) {
      showError(`send fail:{er}`);
      console.error(er);
    }
    setIsDisabled(false);
  };
  const handleCheckQngBalanceClick = async () => {
    if (!qngaddress) {
      // eslint-disable-next-line no-alert
      showError('enter target qng address.');
      return;
    }

    try {
      const ba = (await getQngBalanceByAddress(
        qngaddress,
      )) as unknown as number;
      if (Number(ba) > 0) {
        // eslint-disable-next-line no-alert
        showSuccess(`Find Utxos , balance is ${ba / 1e8}`);
        const utxos = (await getUtxos(qngaddress)) as [];
        console.log(utxos);
        const newOptions = [
          {
            value: 'select',
            label: 'select a utxo',
          },
        ]; //
        for (let i = 0; i < utxos.length; i += 1) {
          const last = utxos[i] as any;
          const v = `${last?.txid}:${last?.idx}:${last?.amount}`;
          newOptions.push({ label: v, value: v });
          setOptions(newOptions);
          console.log(options);
        }
        return;
      }
      // eslint-disable-next-line no-alert
      showError(`Not Found any Utxos,please wait a moment to check`);
    } catch (er) {
      console.error(er);
    }
  };
  const handleImportClick = async (): Promise<void> => {
    try {
      if (options.length < 2) {
        // eslint-disable-next-line no-alert
        showError('please select a utxo.');
        return;
      }
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
      const arr = options[1]?.value.split(':') as any[];
      const txid = arr[0] as string;
      const idx = arr[1] as number;
      // const [txid, idx] = options[1]?.value.split(':');
      const inp = uint8arraytools.toHex(
        getInputHash(txid, idx as unknown as number),
      );

      const accounts = (await window.ethereum.request({
        method: 'eth_accounts',
      })) as string[];
      const from = accounts[0] as string;

      const sig = (await window.ethereum.request({
        method: 'personal_sign',
        params: [`0x${inp}`, from],
      })) as string;

      const recoveredAddress = ethers.utils.verifyMessage(
        getInputHash(txid, idx as unknown as number),
        sig,
      );
      console.log(
        recoveredAddress.toLowerCase() === from.toLowerCase()
          ? 'Valid signature'
          : 'Invalid signature',
      );
      const ret = await checkTxIdSig(txid, idx, sig);

      if (ret === '' || ret === null || ret === undefined) {
        showError(
          'the connected eoa address not match the qng address,please reconnect the right address.',
        );
        return;
      }
      console.log(window.ethereum.selectedAddress as string);
      showSuccess('import success');
      setEoaAddress(window.ethereum.selectedAddress as string);
      setEOABalance(
        await getBalance(window.ethereum.selectedAddress as string),
      );
      console.log(eoaaddress);
      let ba = (await getQngBalanceByAddress(qngaddress)) as unknown as number;
      console.log(ba);
      ba /= 1e8;
      setQngBalance(ba.toString());
    } catch (er) {
      console.error(er);
    }
  };
  const renderStep1 = () => {
    return (
      <div>
        <Modal
          title={modalContent.title}
          open={isModalVisible}
          onOk={handleClose}
          onCancel={handleClose}
        >
          <p>{modalContent.message}</p>
        </Modal>
        {eoaaddress && (
          <div>
            <p>
              {qngaddress !== '' ? (
                <p>
                  <p style={{ color: 'grey' }}>
                    Connected EOA Address:
                    <label style={{ color: 'black', fontSize: '24px' }}>
                      {eoaaddress}{' '}
                    </label>{' '}
                  </p>
                  <p style={{ color: 'grey' }}>
                    EOA Address Balance:
                    <label style={{ color: 'black', fontSize: '24px' }}>
                      {eoaBalance} Meer
                    </label>{' '}
                  </p>
                  <p style={{ color: 'grey' }}>
                    Imported Qng Address:
                    <label style={{ color: 'black', fontSize: '24px' }}>
                      {qngaddress}{' '}
                    </label>{' '}
                  </p>
                  <p style={{ color: 'grey' }}>
                    UTXO Amount:
                    <label style={{ color: 'black', fontSize: '24px' }}>
                      {qngBalance} Meer
                    </label>{' '}
                  </p>
                </p>
              ) : (
                <label style={{ color: 'black', fontSize: '24px' }}>
                  No Imported Qng Address
                </label>
              )}
            </p>

            <StyledButton
              onClick={handleUtxoToEvmFromTargetQngClick}
              disabled={isDisabled}
              style={{
                backgroundColor: isDisabled ? 'gray' : 'blue',
                color: 'white',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {isDisabled ? 'send...' : 'Export Meer to EVM'}
            </StyledButton>
            <StyledButton onClick={() => setEoaAddress('')}>
              Disconnect
            </StyledButton>
          </div>
        )}
        {!eoaaddress && (
          <div>
            <div>
              <Input
                style={{ width: 780 }}
                type="text"
                id="qngaddr"
                name="qngaddr"
                placeholder="Enter your qng address"
                value={qngaddress}
                onChange={(e) => setQngAddress(e.target.value)}
              />
              <StyledButton onClick={handleCheckQngBalanceClick}>
                <FlaskFox />
                <ButtonText>Check Utxos</ButtonText>
              </StyledButton>
            </div>
            <div>
              <StyledButton onClick={handleImportClick}>
                <FlaskFox />
                <ButtonText>Import Qng Account With Verify</ButtonText>
              </StyledButton>
            </div>{' '}
          </div>
        )}
        <div>
          <label style={{ color: 'black' }}>Available Utxos</label>
          <Select
            mode="multiple"
            style={{ width: 800 }}
            onChange={handleSelectChange}
          >
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  };

  return <div>{renderStep1()}</div>;
};
export default Step1Form;
