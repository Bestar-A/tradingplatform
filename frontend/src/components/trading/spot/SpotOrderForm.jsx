import React, { useState, memo } from "react";
import { useTrading } from "../../../hooks/useTrading";
import { Box, Tab, Tabs } from "@mui/material";
import { AvailableSpotUSDTBalance } from "../../common/Balances/Balances";

function a11yProps(index) {
  return {
    id: `order-tab-${index}`,
    "aria-controls": `order-tabpanel-${index}`,
  };
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ minHeight: "400px" }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SpotOrderForm = ({ assetType, balances, currentPrice }) => {
  const { placeSpotOrder, isProcessing } = useTrading();
  const [formData, setFormData] = useState({
    market: { amount: "" },
    limit: { amount: "", price: "" },
  });
  const [value, setValue] = React.useState(0);
  const [sellMode, setSellMode] = React.useState(0);

  const validateOrder = (data, type, positionType) => {
    const amount = parseFloat(data.amount);
    const price = type === "limit" ? parseFloat(data.price) : currentPrice;

    if (isNaN(amount) || amount <= 0) {
      throw new Error("Please enter a valid amount");
    }

    if (type === "limit" && (isNaN(price) || price <= 0)) {
      throw new Error("Please enter a valid price");
    }

    // Check balances
    if (positionType === "buy") {
      const totalCost = amount * price;
      if (totalCost > balances.spotUSDTBalance) {
        throw new Error("Insufficient USDT balance");
      }
    } else {
      const availableAmount = balances.spotBalances[assetType] || 0;
      if (amount > availableAmount) {
        throw new Error(`Insufficient ${assetType} balance`);
      }
    }

    return { amount, limitPrice: type === "limit" ? price : undefined };
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const AltAssetBalances = () => {
    return (
      <span>
        <span className="text-grey">Available: </span>
        {balances.spotBalances[assetType]} {assetType}
      </span>
    );
  };

  const getTotalCost = (type) => {
    const amount = parseFloat(formData[type].amount) || 0;
    const price =
      type === "limit"
        ? parseFloat(formData.limit.price) || currentPrice
        : currentPrice;
    return (amount * price).toFixed(2);
  };

  const handleSubmit = async (type, positionType) => {
    if (isProcessing) return;

    try {
      const data = formData[type];
      const validatedData = validateOrder(data, type, positionType);

      await placeSpotOrder({
        spotAssetType: assetType,
        positionType,
        orderType: type,
        ...validatedData,
      });

      // Clear only amount after successful order
      setFormData((prev) => ({
        ...prev,
        [type]: { ...prev[type], amount: "" },
      }));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Box sx={{ width: "100%" }}>
        <div
          className="button-group gap-10"
          style={{ paddingLeft: 12, paddingRight: 12 }}
        >
          <button
            className={`order-button mode w-50 ${
              sellMode ? "unselected" : "selected"
            }`}
            onClick={() => setSellMode(false)}
          >
            Buy
          </button>
          <button
            className={`order-button mode w-50 ${
              !sellMode ? "unselected" : "selected"
            }`}
            onClick={() => setSellMode(true)}
          >
            Sell
          </button>
        </div>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab sx={{ color: "white" }} label="Market" {...a11yProps(0)} />
            <Tab sx={{ color: "white" }} label="Limit" {...a11yProps(1)} />
          </Tabs>
        </Box>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <div className="input-list-group">
          {sellMode ? <AltAssetBalances /> : <AvailableSpotUSDTBalance />}
          <div className="flex gap-10 flex-col w-full">
            <span style={{ width: 200 }}>
              <label>Amount:</label>
            </span>
            <div className="flex align-center gap-10">
              <input
                type="number"
                value={formData.market.amount}
                onChange={(e) =>
                  handleInputChange("market", "amount", e.target.value)
                }
                min="0"
                step="0.0001"
                className="amount-input flex-1"
                style={{ width: "100%" }}
              />
              <span className="unit-label">{assetType}</span>
            </div>
            {formData.market.amount && (
              <span className="estimated-cost">
                ≈ {getTotalCost("market")} USDT
              </span>
            )}
          </div>
          <div className="button-group gap-10">
            {!sellMode ? (
              <button
                className="order-button long w-full"
                onClick={() => handleSubmit("market", "buy")}
                disabled={isProcessing}
              >
                Buy
              </button>
            ) : (
              <button
                className="order-button short w-full"
                onClick={() => handleSubmit("market", "sell")}
                disabled={isProcessing}
              >
                Sell
              </button>
            )}
          </div>
        </div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <div className="input-list-group">
          {sellMode ? <AltAssetBalances /> : <AvailableSpotUSDTBalance />}
          <div className="flex gap-10 flex-col w-full">
            <span style={{ width: 200 }}>
              <label>Amount:</label>
            </span>
            <div className="flex align-center gap-10">
              <input
                type="number"
                value={formData.limit.amount}
                onChange={(e) =>
                  handleInputChange("limit", "amount", e.target.value)
                }
                min="0"
                step="0.0001"
                className="amount-input flex-1"
                style={{ width: "100%" }}
              />
              <span className="unit-label">{assetType}</span>
            </div>
          </div>
          <div className="flex gap-10 flex-col w-full">
            <span style={{ width: 200 }}>
              <label>Price:</label>
            </span>
            <div className="flex align-center gap-10">
              <input
                type="number"
                value={formData.limit.price}
                onChange={(e) =>
                  handleInputChange("limit", "price", e.target.value)
                }
                min="0"
                step="0.0001"
                className="price-input flex-1"
                style={{ width: "100%" }}
              />
              <span className="unit-label">USDT</span>
            </div>
          </div>
          {formData.market.amount && (
            <span className="estimated-cost">
              ≈ {getTotalCost("limit")} USDT
            </span>
          )}
          <div className="button-group gap-10">
            {!sellMode ? (
              <button
                className="order-button long w-full"
                onClick={() => handleSubmit("limit", "buy")}
                disabled={isProcessing}
              >
                Buy
              </button>
            ) : (
              <button
                className="order-button short w-full"
                onClick={() => handleSubmit("limit", "sell")}
                disabled={isProcessing}
              >
                Sell
              </button>
            )}
          </div>
        </div>
      </CustomTabPanel>
    </div>
  );
};

export default memo(SpotOrderForm);
