/* eslint-disable import/no-unassigned-import */
import React, { useEffect } from 'react';

import Step from '../components/Step';
import './App.css'; // Import your CSS file for styling

const App = () => {
  useEffect(() => {
    document.title = 'Qng UTXO Amount Recovery Tool';
  }, []);
  return (
    <div className="app-container">
      <Step />
    </div>
  );
};

export default App;
