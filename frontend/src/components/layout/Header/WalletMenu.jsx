import React, { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTrading } from "../../../contexts/TradingContext";

const WalletMenuItem = ({ icon, label, balance }) => (
  <div className="wallet-menu-item">
    <div className="wallet-item-left">
      <img src={`/img/${icon}`} alt={label} />
      <span>{label}</span>
    </div>
    <span className="wallet-balance">{balance}</span>
  </div>
);

const WalletMenu = ({ balances }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { calculateTotalValue } = useTrading();
  const Navigate = useNavigate();

  return (
    <div
      className="wallet-menu-container"
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <button className="wallet-menu-trigger">
        <span>Wallets</span>
      </button>

      {isMenuOpen && (
        <div className="wallet-dropdown-menu">
          <div className="balance-info-compact" onClick={() => Navigate('/dashboard')}>
            <WalletMenuItem
              icon="USDT.png"
              label="Balance: "
              balance={(
                calculateTotalValue()
              ).toFixed(2)}
            />
          </div>

          <hr className="menu-separator" />

          <div className="wallet-menu-items">
            <WalletMenuItem
              icon="activity.png"
              label="Spot"
              balance={balances.spotUSDTBalance.toFixed(2)}
            />

            <WalletMenuItem
              icon="lock.png"
              label="Futures"
              balance={balances.futuresUSDTBalance.toFixed(2)}
            />

            <WalletMenuItem
              icon="contact.png"
              label="Copy Trade"
              balance="0.00"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(WalletMenu);