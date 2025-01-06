import React, { useState, memo } from "react";
import { useTrading } from "../../../contexts/TradingContext";
import "./styles.css";

const TransferModal = ({ isOpen, onClose }) => {
  const { balances, updateBalances } = useTrading();
  const [transferType, setTransferType] = useState("fromFutures");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransfer = async () => {
    if (isProcessing) return;

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // Validate balance
    if (
      transferType === "fromFutures" &&
      transferAmount > balances.futuresUSDTBalance
    ) {
      alert("Insufficient USDT in the Futures account");
      return;
    }
    if (
      transferType === "fromSpot" &&
      transferAmount > balances.spotUSDTBalance
    ) {
      alert("Insufficient USDT in the Spot account");
      return;
    }

    setIsProcessing(true);
    try {
      const newBalances = {
        futuresUSDTBalance:
          balances.futuresUSDTBalance +
          (transferType === "fromSpot" ? transferAmount : -transferAmount),
        spotUSDTBalance:
          balances.spotUSDTBalance +
          (transferType === "fromFutures" ? transferAmount : -transferAmount),
      };

      await updateBalances(newBalances);

      setAmount("");
      alert("Transfer completed successfully!");
      onClose();
    } catch (error) {
      alert("Failed to complete transfer: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-transfer">
        <div className="modal-header">
          <h2>USDT Transfer</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="balance-summary">
          <div className="balance-item">
            <span className="balance-label">Futures Balance (USDT)</span>
            <span className="balance-value">
              {balances.futuresUSDTBalance.toFixed(2)}
            </span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Spot Balance (USDT)</span>
            <span className="balance-value">
              {balances.spotUSDTBalance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="transfer-form">
          <div className="form-group">
            <label>Transfer Mode:</label>
            <select
              value={transferType}
              onChange={(e) => setTransferType(e.target.value)}
              className="transfer-select"
            >
              <option value="fromFutures">Futures → Spot</option>
              <option value="fromSpot">Spot → Futures</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount:</label>
            <div className="amount-input-group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                className="amount-input"
                placeholder="Enter amount"
              />
              <span className="currency-label">USDT</span>
            </div>
          </div>

          <button
            className="transfer-button"
            onClick={handleTransfer}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(TransferModal);
