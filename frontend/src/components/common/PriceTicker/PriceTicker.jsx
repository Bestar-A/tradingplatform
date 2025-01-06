import React, { memo } from "react";
import "./styles.css";

const PriceTicker = ({ price }) => {
  const formatPrice = (value) => new Intl.NumberFormat("en-US").format(value);
  const formatPercent = (value) => (value * 100).toFixed(2);

  const percentClass = price.percent >= 0 ? "percent-plus" : "percent-minus";

  return (
    <div className="price-ticker-item">
      <span className="asset-type">{price.assetType}:</span>
      <span className="price-value">{formatPrice(price.price)}</span>
      <span className={`price-percent ${percentClass}`}>
        {formatPercent(price.percent)}%
      </span>
    </div>
  );
};

export default memo(PriceTicker);
