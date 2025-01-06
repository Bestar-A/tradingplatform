import React, { useState } from 'react';
import './PartialCloseModal.css'; // We'll create this CSS file next
import { useTrading } from '../../../contexts/TradingContext';

const PartialCloseModal = ({ position, onClose }) => {
  const [percent, setPercent] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { partialClosePosition, closePosition } = useTrading();
  console.log(position);
  
  const handleSubmit = async () => {
    if (!percent || percent <= 0 || percent > 100) {
      alert('Please enter a valid percentage between 1 and 100');
      return;
    }

    setIsSubmitting(true);
    try {
      if (percent !== 100)
        await partialClosePosition(position.id, percent);
      else
        await closePosition(position.id, "futures");
      onClose();
    } catch (error) {
      alert('Failed to partially close position: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Partial Close Position</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="position-info">
            <p>Position : {position.positionType} {position.assetType}</p>
            <p>Amount (USDT) : {position.amount}</p>
          </div>

          <div className="input-group">
            <label>Close Percentage</label>
            <input
              type="number"
              value={percent}
              onChange={(e) => setPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
              min="1"
              max="100"
            />
            <div className="input-limits" style={{ gap: '10px' }}>
              <span>Min 1%</span>
              <span>Max 100%</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`submit-button ${isSubmitting ? 'disabled' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Confirm'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartialCloseModal;