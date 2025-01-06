import React from "react";
import { useTrading } from "../../../contexts/TradingContext";

const formatNumber = (num, decimals = 2) => {
  return new Intl.NumberFormat("en-US").format(Number(num).toFixed(decimals));
};

const BalanceContainer = ({ label, value, className = "" }) => {
  return (
    <div className="stat-item">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${className}`}>{formatNumber(value)}</span>
    </div>
  );
};

export const AvailableUSDTBalance = () => {
  const { balances } = useTrading();
  return (
    <span>
      <span className="text-grey">Available: </span>{" "}
      {formatNumber(balances.futuresUSDTBalance)} USDT
    </span>
  );
};

export const AvailableSpotUSDTBalance = () => {
  const { balances } = useTrading();
  return (
    <span>
      <span className="text-grey">Available: </span>{" "}
      {formatNumber(balances.spotUSDTBalance)} USDT
    </span>
  );
};

export const FuturesUSDTBalance = () => {
  const { balances } = useTrading();

  return (
    <BalanceContainer
      label="Futures USDT Balance:"
      value={balances.futuresUSDTBalance}
    />
  );
};

export const FuturesValueBalance = () => {
  const {
    balances,
    futuresPositions,
    futuresCurrentPrices,
    calculateUnrealizedPL,
  } = useTrading();

  const calculateFuturesValue = () => {
    const unrealizedPL = futuresPositions.reduce((total, position) => {
      const currentPrice = futuresCurrentPrices.find(
        (p) => p.assetType === position.assetType
      )?.price;

      if (!currentPrice) return total;

      const pnl = calculateUnrealizedPL(
        position.entryPrice,
        currentPrice,
        position.amount,
        position.leverage,
        position.positionType
      );

      return total + pnl;
    }, 0);

    const positionsAmount = futuresPositions.reduce(
      (total, pos) => total + pos.amount,
      0
    );
    return balances.futuresUSDTBalance + positionsAmount + unrealizedPL;
  };

  const value = calculateFuturesValue();
  const className = value >= 0 ? "positive" : "negative";

  return (
    <BalanceContainer
      label="Futures Total Value:"
      value={value}
      className={className}
    />
  );
};

export const SpotUSDTBalance = () => {
  const { balances } = useTrading();

  return (
    <BalanceContainer
      label="Spot USDT Balance:"
      value={balances.spotUSDTBalance}
    />
  );
};

export const SpotValueBalance = () => {
  const { balances, spotCurrentPrices } = useTrading();

  const calculateSpotValue = () => {
    let total = balances.spotUSDTBalance;

    Object.entries(balances.spotBalances || {}).forEach(([asset, amount]) => {
      if (amount > 0) {
        const price =
          spotCurrentPrices.find((p) => p.assetType === asset)?.price || 0;
        total += amount * price;
      }
    });

    return total;
  };

  return (
    <BalanceContainer label="Spot Total Value:" value={calculateSpotValue()} />
  );
};

export const TotalUSDTBalance = () => {
  const { balances } = useTrading();

  const totalUSDT = balances.spotUSDTBalance + balances.futuresUSDTBalance;

  return <BalanceContainer label="Total USDT Balance:" value={totalUSDT} />;
};

export const TotalValueBalance = () => {
  const { calculateTotalValue } = useTrading();

  return (
    <BalanceContainer
      label="Total Portfolio Value:"
      value={calculateTotalValue()}
      className="positive"
    />
  );
};

export const AssetBalances = ({ list = null }) => {
  const { balances, spotCurrentPrices } = useTrading();

  const formatNumber = (num, decimals = 2) => {
    return new Intl.NumberFormat("en-US").format(
      parseFloat(num).toFixed(decimals)
    );
  };

  const calculateAssetValue = (asset, amount) => {
    const price =
      spotCurrentPrices.find((p) => p.assetType === asset)?.price || 0;
    return price * amount;
  };

  return (
    <div className="asset-balances">
      {!list && <span className="balance-label">Est. Balances: </span>}
      <div
        className="balance-list"
        style={!list ? { flexDirection: "row" } : { flexDirection: "column" }}
      >
        <div className="balance-item">
          <span className="crypto-icon-small" style={{ paddingLeft: "4px" }}>
            <img
              src={`/icon/USDT.png`}
              alt={"USDT"}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/icon/default.png";
              }}
            />
          </span>
          <span className="balance-asset">USDT</span>
          <span className="balance-value">
            {formatNumber(balances.spotUSDTBalance, 2)}
          </span>
        </div>
        {Object.entries(balances.spotBalances || {}).map(
          ([asset, amount]) =>
            amount > 0 && (
              <div key={asset} className="balance-item">
                <span
                  className="crypto-icon-small"
                  style={{ paddingLeft: "4px" }}
                >
                  <img
                    src={`/icon/${asset}.png`}
                    alt={asset}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/icon/default.png";
                    }}
                  />
                </span>
                <span className="balance-asset">{asset}</span>
                <span className="balance-value">
                  {formatNumber(amount, 8)}
                  <span className="balance-value-usd">
                    ≈ ${formatNumber(calculateAssetValue(asset, amount), 2)}
                  </span>
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
};

// Default export all components as a group
export default {
  FuturesUSDTBalance,
  FuturesValueBalance,
  SpotUSDTBalance,
  SpotValueBalance,
  TotalUSDTBalance,
  TotalValueBalance,
  AssetBalances,
};
