import React from 'react';

import import1img from '../assets/import1.png'; // Path to your image file
import import2img from '../assets/import2.png';
import import3img from '../assets/import3.png';
import import4img from '../assets/import4.png';

const ModalTurorial = ({ onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <div className="tutorial">
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
          <p className="title">
            1. Import your Qng Wallet Private Key to your MetaMask
          </p>
          <img src={import1img} />
          <img src={import2img} />
          <p className="title">
            2. Input your Qng Address Then Click <b>Qng Amount Recorery</b>{' '}
            Button
          </p>
          <img src={import3img} />
          <p className="title">
            3. Select the UTXO And Click <b>Export Meer to EVM </b> Button
          </p>
          <img src={import4img} />
          <div className="input-container">
            <button className="submit-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTurorial;
