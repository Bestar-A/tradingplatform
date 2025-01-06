import React, { memo, useState } from "react";
import "./styles.css";

const AssetSelector = ({ type, selectedAsset, onAssetSelect, currentPrices = [], dropdownId, optionsId }) => {
	const [isOpen, setIsOpen] = useState(false);

	const formatPrice = (price) => new Intl.NumberFormat("en-US").format(price || 0);

	const formatPercent = (percent) => ((percent || 0) * 100).toFixed(2);

	const renderSelectedAsset = () => {
		if (!Array.isArray(currentPrices)) return null;
		const price = currentPrices.find((p) => p?.assetType === selectedAsset);
		if (!price) {
			// Render default state if no price found
			return (
				<div className="selected-asset-default">
					<span className="crypto-icon-small">
						<img
							src={`/icon/${selectedAsset}.png`}
							style={{ width: "48px", height: "48px" }}
							alt={selectedAsset}
							onError={(e) => {
								e.target.onerror = null;
								e.target.src = "/icon/default.png";
							}}
						/>
					</span>
					<span className="money-type">{selectedAsset}_USDT</span>
				</div>
			);
		}
		const percentClass = (price.percent || 0) >= 0 ? "percent-plus" : "percent-minus";
		// Selected
		return (
			<div className="selected-asset" style={{ paddingLeft: "10px" }}>
				<span className="crypto-icon-small">
					<img
						src={`/icon/${selectedAsset}.png`}
						style={{ width: "48px", height: "48px" }}
						alt={selectedAsset}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = "/icon/default.png";
						}}
					/>
				</span>
				<span className="money-type" style={{ marginLeft: "5px" }}>
					{selectedAsset}&nbsp;&nbsp;
				</span>
				<span className="money-value">{formatPrice(price.price)}</span>
				&nbsp;&nbsp;
				<span className={percentClass}>{formatPercent(price.percent)}%</span>
				<div>
					<div style={{ textWrap: "nowrap" }}>24h High</div>
					<div className="money-value">{formatPrice(price.high24price)}</div>
				</div>
				<div>
					<div style={{ textWrap: "nowrap" }}>24h Low</div>
					<div className="money-value">{formatPrice(price.low24price)}</div>
				</div>
				<div>
					<div style={{ textWrap: "nowrap" }}>24h Volume</div>
					<div className="money-value">{formatPrice(price.volume24)}</div>
				</div>
				<div>
					<div style={{ textWrap: "nowrap" }}>24h Amount</div>
					<div className="money-value">{formatPrice(price.amount24)}</div>
				</div>
			</div>
		);
	};

	const renderAssetOption = (asset, price) => {
		if (!price) return null;
		const percentClass = (price.percent || 0) >= 0 ? "percent-plus" : "percent-minus";
		// Unselected
		return (
			<div className="dropdown-option" key={asset}>
				<span className="crypto-icon-small" style={{ paddingLeft: "4px" }}>
					<img
						src={`/icon/${asset}.png`}
						alt={asset}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = "/icon/default.png";
						}}
					/>
				</span>
				<span className="money-type" style={{ marginLeft: "5px" }}>
					{asset}&nbsp;
				</span>
				<span className="money-value">{formatPrice(price.price)}</span>
				&nbsp;&nbsp;
				<span className={percentClass}>{formatPercent(price.percent)}%</span>
			</div>
		);
	};

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const handleSelect = (assetType) => {
		onAssetSelect(assetType);
		setIsOpen(false);
	};

	return (
		<div className="custom-dropdown">
			<div className="custom-dropdown-selected" id={dropdownId} onClick={toggleDropdown}>
				{" "}
				{renderSelectedAsset()}
			</div>
			{isOpen && (
				<div className="custom-dropdown-options" id={optionsId}>
					{Array.isArray(currentPrices) &&
						currentPrices
							.filter((price) => price?.assetType !== selectedAsset)
							.map((price) => (
								<div key={price?.assetType} onClick={() => handleSelect(price?.assetType)}>
									{renderAssetOption(price?.assetType, price)}
								</div>
							))}
				</div>
			)}
		</div>
	);
};

export default memo(AssetSelector);
