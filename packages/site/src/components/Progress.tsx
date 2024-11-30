/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';

const ModalProgress = () => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      if (counter < 100) {
        setProgress(counter);
        counter++;
      } else {
        clearInterval(interval);
      }
    }, 15); // Increase every 50ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="modal">
      <div className="modal-content">
        <p className="progress-bar-text">Import Address UTXO Progress</p>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProgress;
