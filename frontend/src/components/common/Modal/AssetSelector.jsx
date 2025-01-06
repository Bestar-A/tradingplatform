import React, { useState, memo } from "react";
import "./styles.css";

const AssetSelector = memo(({ assets, selectedAsset, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="custom-dropdown">
      <div
        className="custom-dropdown-selected"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-content">
          {assets.find((a) => a.label === selectedAsset) && (
            <img
              src={`/img/${assets.find((a) => a.label === selectedAsset).icon}`}
              alt={selectedAsset}
              className="asset-icon"
            />
          )}
          <span>{selectedAsset}</span>
        </div>
        <span className="dropdown-arrow">
          <img src="/img/arrow-right.png" width="14px" alt="arrow" />
        </span>
      </div>

      {isOpen && (
        <div className="custom-dropdown-options">
          {assets.map((asset) => (
            <div
              key={asset.label}
              className="custom-dropdown-option"
              onClick={() => {
                onSelect(asset.label);
                setIsOpen(false);
              }}
            >
              <img
                src={`/img/${asset.icon}`}
                alt={asset.label}
                className="asset-icon"
              />
              <span>{asset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default AssetSelector;
