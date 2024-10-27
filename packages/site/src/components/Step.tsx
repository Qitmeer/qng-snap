import React, { Suspense, useState } from 'react';
const Step1Form = React.lazy(() => import('./Step1'));
const Step2Form = React.lazy(() => import('./Step2'));
const Step3Form = React.lazy(() => import('./Step3'));
import styled from 'styled-components';

const Box = styled.div`
  width: 800px;
  height: 800px;
  background-color: #fff;
  border: 2px solid #000;
  display: flex;
  color: white;
  font-size: 20px;
`;
const Button = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;
export const StepForm = () => {
  const [step, setStep] = useState(1);
  const enterStep = (num: number) => {
    setStep(num);
  };
  const renderStep = () => {
    switch (step) {
      case 1: // first check utxo balance
        return <Step1Form enterStep={enterStep} />;
      case 2:
        return <Step2Form enterStep={enterStep} _qngaddress="" value="" />;
      case 3:
        return <Step3Form enterStep={enterStep} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Button onClick={() => enterStep(1)} disabled={step === 1}>
        Find Qng Utxos
      </Button>
      {' - '}

      <Button onClick={() => enterStep(3)} disabled={step === 3}>
        Connect AA Account
      </Button>
      <Suspense fallback={<div>Loading...</div>}>
        <Box>{renderStep()}</Box>
      </Suspense>
    </div>
  );
};
