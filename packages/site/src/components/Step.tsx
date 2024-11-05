/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-unmodified-loop-condition */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable id-length */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable id-denylist */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Modal, Button } from 'antd';
import React, { useRef, useState } from 'react';
import * as uint8arraytools from 'uint8array-tools';

import { getBalance } from '../utils';
import { checkTxIdSig, getAbstractAccount, sendToBundler } from '../utils/aa';
import { getQngBalanceByAddress, getUtxos } from '../utils/qng';
import { getInputHash, getMultiInputHash } from '../utils/utils';
import ModalProgress from './Progress';
import ModalTurorial from './Tutorial';

const FirstStep = () => {
  const [data, setData] = useState([]);
  const [eoaaddress, setEoaAddress] = useState('');
  const [aaaddress, setAaAddress] = useState('');
  const [qngaddress, setQngAddress] = useState('');
  const [eoaBalance, setEOABalance] = useState('0');
  const [qngBalance, setQngBalance] = useState('0');
  const [aaBalance, setAaBalance] = useState('0');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [checkboxes, setCheckboxes] = useState({} as any);
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const handleResolve = useRef(null) as any;
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    isSuccess: false,
  });
  const showSuccess = async (msg: string) => {
    return new Promise((resolve: any) => {
      setModalContent({
        title: 'Success',
        message: msg,
        isSuccess: true,
      });
      setIsModalVisible(true);
      handleResolve.current = resolve;
    });
  };

  const showError = async (msg: string) => {
    return new Promise((resolve: any) => {
      setModalContent({
        title: 'Error',
        message: msg,
        isSuccess: false,
      });
      setIsModalVisible(true);
      handleResolve.current = resolve;
    });
  };

  const handleOK = () => {
    setIsModalVisible(false);
    if (handleResolve.current) {
      handleResolve.current(true);
    }
  };
  const handleClose = () => {
    setIsModalVisible(false);
    if (handleResolve.current) {
      handleResolve.current(false);
    }
  };
  const reloadBalance = async () => {
    setIsDisabled(true);
    toggleModal();
    const utxos = (await getUtxos(qngaddress)) as [];
    console.log(utxos);
    setData([] as never[]);
    const rows = [] as any[];
    setCheckboxes({} as any);
    for (let i = 0; i < utxos.length; i += 1) {
      const last = utxos[i] as any;
      const v = `${last?.txid}:${last?.idx}:${last?.amount}`;
      let amount = last?.amount as number;
      amount /= 1e8;
      rows.push({
        v,
        txid: last?.txid,
        idx: last?.idx,
        amount,
      });
      setCheckboxes((prev: any) => ({
        ...prev,
        [v]: false,
      }));
    }
    const ba = (await getQngBalanceByAddress(qngaddress)) as unknown as number;
    setQngBalance((ba / 1e8).toString());
    const aa = await getAbstractAccount();
    const aaAddress = await aa.getAccountAddress();
    setAaAddress(aaAddress);
    setAaBalance(await getBalance(aaAddress));
    setEoaAddress(window.ethereum.selectedAddress as string);
    setEOABalance(await getBalance(window.ethereum.selectedAddress as string));
    setIsDisabled(false);
    setTimeout(() => {
      setShowModal(false);
      setData(rows as never[]);
    }, 1500);
  };
  const handleRecoveryClick = async () => {
    if (!qngaddress) {
      // eslint-disable-next-line no-alert
      await showError('Please Enter your wallet qng address.');
      return;
    }

    try {
      setIsDisabled(true);
      const ba = (await getQngBalanceByAddress(
        qngaddress,
      )) as unknown as number;
      if (Number(ba) > 0) {
        setQngBalance((ba / 1e8).toString());
        const oneutxos = (await getUtxos(qngaddress, 1)) as any[];
        if (oneutxos.length === 0) {
          // eslint-disable-next-line no-alert
          await showError('Wait For a moment');
          setIsDisabled(false);
          return;
        }
        const one = oneutxos[0];
        console.log(one);
        // eslint-disable-next-line no-alert
        await showSuccess(
          `Find Utxos , balance is ${ba / 1e8} Start Connected EOA Address...`,
        );
        const lastFrom = localStorage.getItem(qngaddress);
        if (!lastFrom) {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [
              {
                eth_accounts: {},
              },
            ],
          });
        }
        const txid = one.txid as string;
        const idx = one.idx as number;
        const inp = uint8arraytools.toHex(
          getInputHash(txid, idx as unknown as number),
        );
        const accounts = (await window.ethereum.request({
          method: 'eth_accounts',
        })) as string[];
        const from = accounts[0] as string;
        console.log(from, lastFrom);
        if (lastFrom && from !== lastFrom) {
          // eslint-disable-next-line no-alert
          await showError(
            'The connected EOA address not match the qng address,please reconnect the right address with qng wallet private import.',
          );
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [
              {
                eth_accounts: {},
              },
            ],
          });
        }
        if (!lastFrom) {
          const sig = (await window.ethereum.request({
            method: 'personal_sign',
            params: [`0x${inp}`, from],
          })) as string;
          if (sig === null || sig === undefined) {
            // eslint-disable-next-line no-alert
            await showError('Sign Refuse,Please ReSign Again');
            setIsDisabled(false);
            return;
          }
          const ret = await checkTxIdSig(txid, idx, sig);
          if (ret === '' || ret === null || ret === undefined) {
            await showError(
              'The connected EOA address not match the qng address,please reconnect the right address with qng wallet private import.',
            );
            setIsDisabled(false);
            return;
          }
        }

        await reloadBalance();
        localStorage.setItem(qngaddress, from);
        return;
      }
      // eslint-disable-next-line no-alert
      await showError(`Not Found any Utxos,please wait a moment to check`);
    } catch (er: any) {
      await showError(`Cancel recovery,${er.message}`);
      console.error(er);
    }
    setIsDisabled(false);
  };
  const handleCheckItem = (event: { target: { name: any; checked: any } }) => {
    const { name, checked } = event.target;
    console.log(event, name, checked);
    setCheckboxes((prev: any) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleCheckAll = (event: { target: { checked: any } }) => {
    const isChecked = event.target.checked;
    const newCheckedItems = Object.keys(checkboxes).reduce((acc: any, key) => {
      acc[key] = isChecked;
      return acc;
    }, {});
    setCheckboxes(newCheckedItems);
  };
  const allChecked = Object.values(checkboxes).every(Boolean);
  const anyChecked = Object.values(checkboxes).some(Boolean);
  const handleUtxoExportClick = async () => {
    const selectedOptions = Object.keys(checkboxes).filter(
      (key) => checkboxes[key],
    );
    console.log(selectedOptions);

    try {
      let ops = '';
      if (selectedOptions.length <= 0) {
        // all
        // eslint-disable-next-line no-alert
        for (let i = 0; i < data.length; i++) {
          const v = data[i] as any;
          const txid = v.txid as string;
          const idx = v.idx as number;
          ops = `${ops + txid}:${idx},`;
        }
      } else {
        console.log('selectedOptions', selectedOptions);
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
      const accounts = (await window.ethereum.request({
        method: 'eth_accounts',
      })) as string[];
      const from = accounts[0] as string;
      console.log(inp, from);
      const sign = (await window.ethereum.request({
        method: 'personal_sign',
        params: [`0x${inp}`, from],
      })) as string;
      if (sign === null || sign === undefined) {
        // eslint-disable-next-line no-alert
        await showError('Sign Refuse,Please ReSign Again');
        setIsDisabled(false);
        return;
      }
      const res = await sendToBundler(ops, fee, sign);
      await showSuccess(`Send success,txid:${res}`);
      await reloadBalance();
      console.log(res);
    } catch (er: any) {
      await showError(`Send fail:${er.message}`);
      console.error(er);
    }
    setIsDisabled(false);
  };
  const toggleTuorial = () => {
    setShowTutorial(!showTutorial);
  };

  return (
    <div>
      <button className="submit-button" onClick={toggleTuorial}>
        Click to view tutorial
      </button>
      {showTutorial && <ModalTurorial onClose={toggleTuorial} />}
      {showModal && <ModalProgress onClose={toggleModal} />}
      <Modal
        title={modalContent.title}
        open={isModalVisible}
        onOk={handleOK}
        footer={[
          <Button key="ok" type="primary" onClick={handleOK}>
            OK
          </Button>,
        ]}
      >
        <p>{modalContent.message}</p>
      </Modal>
      {!eoaaddress && (
        <div>
          <div className="input-container">
            <input
              type="text"
              className="input-field"
              value={qngaddress}
              placeholder="Enter your Qng address here(Mmxxxx....)"
              onChange={(ee) => setQngAddress(ee.target.value)}
            />
          </div>
          <div className="input-container">
            <button
              className="submit-button"
              disabled={isDisabled}
              onClick={handleRecoveryClick}
            >
              {isDisabled ? 'Checking...' : 'Qng Amount Recovery'}
            </button>
          </div>
        </div>
      )}
      {eoaaddress && (
        <div>
          <p className="textbox">
            <p>
              <label className="subtitle">Imported Qng Address:</label>
              <label className="text hightlight">{qngaddress} </label>{' '}
            </p>
            <p>
              <label className="subtitle">UTXO Amount:</label>
              <label className="text hightlight">{qngBalance} Meer</label>{' '}
            </p>
            <p>
              <label className="subtitle">Connected EOA Address:</label>
              <label className="text hightlight">{eoaaddress} </label>{' '}
            </p>
            <p>
              <label className="subtitle">EOA Address Balance:</label>
              <label className="text hightlight">{eoaBalance} Meer</label>{' '}
            </p>
            <p>
              <label className="subtitle">AA Address of the EOA:</label>
              <label className="text hightlight">{aaaddress} </label>{' '}
            </p>
            <p>
              <label className="subtitle">AA Address Balance:</label>
              <label className="text hightlight">{aaBalance} Meer</label>{' '}
            </p>
          </p>
          <div className="input-container">
            <button
              className="submit-button"
              onClick={handleUtxoExportClick}
              disabled={isDisabled}
            >
              {isDisabled ? 'Wait For Transaction...' : 'Export Meer to EVM'}
            </button>

            <button
              className="submit-button"
              disabled={isDisabled}
              onClick={reloadBalance}
            >
              Reload
            </button>

            <button
              className="submit-button"
              onClick={() => {
                setEoaAddress('');
                setData([]);
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={allChecked}
                  onChange={handleCheckAll}
                />
                {'Select/Deselect All'}
              </th>
              <th>txid</th>
              <th>idx</th>
              <th>amount(MEER)</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, index) => (
              <tr key={index}>
                <td>
                  <input
                    className="checkbox"
                    type="checkbox"
                    value={row.v}
                    checked={checkboxes[row.v]}
                    onChange={handleCheckItem}
                    name={row.v}
                  />{' '}
                  {index + 1}
                </td>
                <td>
                  <a
                    href={`https://meerscan.io/tx/${row.txid}`}
                    target="_blank"
                  >
                    {row.txid}
                  </a>
                </td>
                <td>{row.idx}</td>
                <td>{row.amount}</td>
                <td>available</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FirstStep;
