import React, { memo } from "react";
import {
  FuturesUSDTBalance,
  FuturesValueBalance,
  TotalUSDTBalance,
  TotalValueBalance,
} from "../../common/Balances/Balances";
import "./styles.css";

const FuturesStatistics = () => {
  return (
    <>
      <div className="total-statistics app-container">
        <TotalUSDTBalance />
        <TotalValueBalance />
      </div>
      <div className="futures-statistics app-container">
        <FuturesUSDTBalance />
        <FuturesValueBalance />
      </div>
    </>
  );
};

export default memo(FuturesStatistics);
