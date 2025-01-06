import React from 'react';
import {
  AssetBalances,
  FuturesUSDTBalance,
  FuturesValueBalance,
  SpotUSDTBalance,
  SpotValueBalance,
  TotalUSDTBalance,
  TotalValueBalance
} from '../../common/Balances/Balances';

const BalanceDashboard = () => {

  return (
    <div style={{ marginTop: "80px", padding: '0 30px'}}>
      {/* Total Portfolio Section */}
      <div>
        <h2>Total Portfolio</h2>
        <div>
          <TotalUSDTBalance />
          <TotalValueBalance />
        </div>
      </div>

      {/* Futures Section */}
      <div>
        <h2>Futures Account</h2>
        <div>
          <FuturesUSDTBalance />
          <FuturesValueBalance />
        </div>
      </div>

      {/* Spot Section */}
      <div>
        <h2>Spot Account</h2>
        <div>
          <SpotUSDTBalance />
          <SpotValueBalance />
          <AssetBalances />
        </div>
      </div>
    </div>
  );
};

export default BalanceDashboard;