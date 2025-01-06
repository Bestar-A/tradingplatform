import React, { memo } from "react";
import { useTrading } from "../../../contexts/TradingContext";
import AssetSelector from "../../common/AssetSelector/AssetSelecter";
import TradingViewWidget from "../../common/Chart/TradingViewWidget";
import FuturesOrderForm from "./FuturesOrderForm";
import FuturesPositions from "./FuturesPositions";
import FuturesStatistics from "./FuturesStatistics";
import PriceTicker from "../../common/PriceTicker/PriceTicker";
import "./styles.css";
import { useAuth } from "../../../contexts/AuthContext";
import WalletPanel from "../../common/WalletPanel";

const FuturesTrading = () => {
  const {
    futuresAssetType,
    setFuturesAssetType,
    futuresCurrentPrices,
    balances,
  } = useTrading();
  const { isAuthenticated } = useAuth();

  return (
    <div
      id="futures"
      className={`trading-panel visible`}
      style={{ display: "block" }}
    >
      {/* {isAuthenticated && <FuturesStatistics />} */}
      <div id="futures-now-price" className="price-ticker app-container">
        {futuresCurrentPrices.map((price) => (
          <PriceTicker key={price.assetType} price={price} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "5px" }}>
        <div
          style={{
            width: "2%",
            margin: "5px 0",
            backgroundColor: "#16171a",
            borderRadius: "4px",
          }}
        ></div>
        <div style={{ margin: "5px 0px", width: "25%" }}>
          <AssetSelector
            type="futures"
            selectedAsset={futuresAssetType}
            onAssetSelect={setFuturesAssetType}
            currentPrices={futuresCurrentPrices}
            dropdownId="futures-dropdownSelected"
            optionsId="futures-dropdownOptions"
          />
        </div>
        <div
          style={{
            width: "78%",
            margin: "5px 0",
            backgroundColor: "#16171a",
            borderRadius: "4px",
          }}
        ></div>
      </div>

      <div style={{ display: "flex", gap: "5px" }} className="app-container">
        <div className="chart-container">
          <TradingViewWidget
            symbol={`${futuresAssetType}USDT`}
            id={`chart_${futuresAssetType.toLowerCase()}`}
          />
        </div>
        <div className="order-panel">
          {isAuthenticated && (
            <FuturesOrderForm
              assetType={futuresAssetType}
              balance={balances.futuresUSDTBalance}
            />
          )}
        </div>
      </div>
      <div style={{ display: "flex" }} className="app-container">
        <div className="flex-1" style={{ width: "calc(100% - 400px)" }}>
          <FuturesPositions />
        </div>
        <div style={{ width: 400, flex: 0 }}>
          {isAuthenticated && (
            <WalletPanel
              assetType={futuresAssetType}
              balance={balances.futuresUSDTBalance}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(FuturesTrading);
