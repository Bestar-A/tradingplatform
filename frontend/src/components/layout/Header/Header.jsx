import React, { memo } from "react";
import Navigation from "../Navigation/Navigation";
import UserMenu from "./UserMenu";
import WalletMenu from "./WalletMenu";
import { useTrading } from "../../../contexts/TradingContext";
import "./styles.css";
import { useAuth } from "../../../contexts/AuthContext";
import { AccountBalanceWallet, SwapHoriz } from "@mui/icons-material";

const Header = ({ onOpenTransfer, onOpenDeposit }) => {
  const { balances } = useTrading();
  const { isAuthenticated } = useAuth();
  return (
    <header className="main-header">
      <div className="nav-left">
        <Navigation />
      </div>
      {isAuthenticated ? (
        <div className="nav-right">
          <button
            className="action-button deposit-btn"
            onClick={onOpenTransfer}
          >
            <SwapHoriz />
            Transfer
          </button>

          <button className="action-button deposit-btn" onClick={onOpenDeposit}>
            <AccountBalanceWallet />
            Deposit
          </button>

          <WalletMenu balances={balances} />
          <UserMenu />
        </div>
      ) : (
        <div className="nav-right">
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>
      )}
    </header>
  );
};

export default memo(Header);
