import React, { useState, useEffect, memo } from "react";
import { useTrading } from "../../../contexts/TradingContext";
import NetworkSelector from "./NetworkSelector";
import AssetSelector from "./AssetSelector";
import "./styles.css";

const DEFAULT_ASSETS = [
  { label: "ETH", icon: "ETH.png", minWithdraw: "0.01" },
  { label: "BRETT", icon: "brett.png", minWithdraw: "1" },
  { label: "PEOPLE", icon: "people.png", minWithdraw: "10" },
  { label: "USDT", icon: "USDT.png", minWithdraw: "1.5" },
  { label: "USDC", icon: "USDC.png", minWithdraw: "1.5" },
  { label: "BNB", icon: "BNB.png", minWithdraw: "0.01" },
];

const DEFAULT_NETWORKS = [
  { label: "ERC-20", icon: "ETH3.png", fee: "15 USDT" },
  { label: "BSC", icon: "bsc.png", fee: "0.5 USDT" },
  { label: "Base", icon: "base.png", fee: "0.3 USDT" },
  { label: "Arbitrum One", icon: "arb.png", fee: "0.5 USDT" },
];

const DepositModal = ({ isOpen, onClose }) => {
  // States
  const [activeTab, setActiveTab] = useState("deposit");
  const [selectedAsset, setSelectedAsset] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("ERC-20");
  const [qrCode, setQrCode] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Get data from trading context
  const {
    balances,
    userData,
    withdrawFunds,
  } = useTrading();

  // Map assets with balances
  const assets = DEFAULT_ASSETS.map((asset) => ({
    ...asset,
    balance:
      asset.label === "USDT"
        ? balances.spotUSDTBalance.toFixed(2)
        : balances.spotBalances[asset.label]?.toFixed(8) || "0.00",
  }));

  // Effects
  useEffect(() => {
    if (isOpen && userData.address && activeTab === "deposit") {
      generateQRCode(userData.address);
    }
  }, [isOpen, userData.address, selectedNetwork, selectedAsset, activeTab]);

  useEffect(() => {
    // Reset form on tab change
    setWithdrawAmount("");
    setWithdrawAddress("");
    setError("");
  }, [activeTab]);

  // QR Code generation
  const generateQRCode = async (address) => {
    try {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        address
      )}&size=150x150`;
      setQrCode(qrCodeUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  // Clipboard functions
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userData.address);
      alert("Address copied to clipboard");
    } catch (err) {
      alert("Failed to copy address");
    }
  };

  // Validation
  const validateWithdrawal = () => {
    console.log(withdrawAddress.length);
    if (!withdrawAddress/*  || withdrawAddress.length !== 43 */) {
      setError("Please enter a valid address");
      return false;
    }

    const amount = parseFloat(withdrawAmount);
    console.log(amount);
    const minAmount = parseFloat(
      DEFAULT_ASSETS.find((a) => a.label === selectedAsset)?.minWithdraw || "0"
    );
    const balance = parseFloat(
      assets.find((a) => a.label === selectedAsset)?.balance || "0"
    );

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    if (amount < minAmount) {
      setError(`Minimum withdrawal amount is ${minAmount} ${selectedAsset}`);
      return false;
    }

    if (amount > balance) {
      setError("Insufficient balance");
      return false;
    }

    return true;
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!validateWithdrawal()) return;

    setIsProcessing(true);
    setError("");

    try {
      await withdrawFunds({
        asset: selectedAsset,
        network: selectedNetwork,
        amount: withdrawAmount,
        address: withdrawAddress,
      });

      onClose();
      alert("Withdrawal pending..");
    } catch (err) {
      setError(err.message || "Failed to process withdrawal");
    } finally {
      setIsProcessing(false);
    }
  };

  // Modal close handlers
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="modal-content deposit-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Transfer Crypto</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="deposit-tabs">
          <button
            className={`tab-button ${activeTab === "deposit" ? "active" : ""}`}
            onClick={() => setActiveTab("deposit")}
          >
            Deposit
          </button>
          <button
            className={`tab-button ${activeTab === "withdraw" ? "active" : ""}`}
            onClick={() => setActiveTab("withdraw")}
          >
            Withdraw
          </button>
        </div>

        {/* Asset & Network Selectors - Common for both tabs */}
        <div className="selector-container">
          <div className="selector-group">
            <label className="selector-label">Choose Asset</label>
            <AssetSelector
              assets={assets}
              selectedAsset={selectedAsset}
              onSelect={setSelectedAsset}
            />
          </div>

          <div className="selector-group">
            <label className="selector-label">Choose Network</label>
            <NetworkSelector
              networks={DEFAULT_NETWORKS}
              selectedNetwork={selectedNetwork}
              onSelect={setSelectedNetwork}
            />
          </div>
        </div>

        {/* Deposit Content */}
        {activeTab === "deposit" && (
          <div className="deposit-info">
            <div className="qr-container">
              {qrCode && <img src={qrCode} alt="QR Code" className="qr-code" />}
            </div>

            <div className="address-container">
              <label className="address-label">Deposit Address</label>
              <div className="address-box">
                <span className="address-text">{userData.address}</span>
                <button className="copy-button" onClick={copyAddress}>
                  <img src="/img/copy.png" alt="Copy" className="copy-icon" />
                </button>
              </div>
            </div>

            <div className="warning-container">
              <img
                src="/img/warning2.png"
                alt="Warning"
                className="warning-icon"
              />
              <p className="warning-text">
                Minimum Deposit:{" "}
                {
                  DEFAULT_ASSETS.find((a) => a.label === selectedAsset)
                    ?.minWithdraw
                }{" "}
                {selectedAsset}
              </p>
            </div>
          </div>
        )}

        {/* Withdraw Content */}
        {activeTab === "withdraw" && (
          <div className="withdraw-content">
            <div className="withdraw-form">
              <div className="input-group">
                <label>Withdrawal Address</label>
                <div className="input-wrapper" style={{width: "100%"}}>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder={`Enter ${selectedAsset} Address`}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Amount</label>
                <div className="input-wrapper amount-input">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={isProcessing}
                  />
                  <span className="asset-label">{selectedAsset}</span>
                </div>
                <div className="balance-info">
                  Available:{" "}
                  {assets.find((a) => a.label === selectedAsset)?.balance}{" "}
                  {selectedAsset}
                </div>
              </div>

              <div className="fee-info">
                <span>Network Fee:</span>
                <span>
                  {
                    DEFAULT_NETWORKS.find((n) => n.label === selectedNetwork)
                      ?.fee
                  }
                </span>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                className="withdraw-button"
                onClick={handleWithdraw}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Withdraw"}
              </button>

              <div className="warning-container">
                <img
                  src="/img/warning2.png"
                  alt="Warning"
                  className="warning-icon"
                />
                <div className="warning-content">
                  <p className="warning-text">
                    Minimum Withdrawal:{" "}
                    {
                      DEFAULT_ASSETS.find((a) => a.label === selectedAsset)
                        ?.minWithdraw
                    }{" "}
                    {selectedAsset}
                  </p>
                  <p className="warning-text">
                    Please double-check the address and network before
                    confirming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(DepositModal);
