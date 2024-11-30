/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/order */
/* eslint-disable import/no-unassigned-import */
import React, { useEffect } from 'react';
import './Loader.css'; //
import { ethers } from 'ethers';

const Loader = ({ increment, originNumber }) => {
  const [currentBlockNumber, setCurrentBlockNumber] = React.useState(0);
  const [targetNum, setTargetNum] = React.useState(0);
  let tbnum = 0;
  const gap = 1;
  useEffect(() => {
    const getBlockNumber = async () => {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any,
      );
      const bnum = await provider.getBlockNumber();
      console.log(bnum, tbnum);
      if (tbnum <= 0) {
        setTargetNum(bnum + gap);
        tbnum = bnum + gap;
      }
      setCurrentBlockNumber(bnum);
      if (bnum >= tbnum) {
        return true;
      }
      setTimeout(getBlockNumber, 1000);
    };
    getBlockNumber();
  }, []);
  return (
    <div className="loader-overlay">
      <div className="loader"></div>
      <p>Current EOA Balance: {originNumber} MEER</p>
      <p>EOA Will Receive : +{increment} MEER</p>
      <p>Current Block Number: {currentBlockNumber}</p>
      <p>Target Block Number : {targetNum}</p>
    </div>
  );
};

export default Loader;
