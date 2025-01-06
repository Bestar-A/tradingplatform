import React, { useState, memo, useMemo } from "react";
import { Tabs, Box, Tab, Slider, Button, Popover } from "@mui/material";
import { useTrading } from "../../../hooks/useTrading";
import { useTrading as useTradingContext } from "../../../contexts/TradingContext";
import { AvailableUSDTBalance } from "../../common/Balances/Balances";

const followersMarks = [
  {
    value: 1,
    label: "1x",
  },
  {
    value: 50,
    label: "50x",
  },
  {
    value: 100,
    label: "100x",
  },
  {
    value: 150,
    label: "150x",
  },
  {
    value: 200,
    label: "200x",
  },
  {
    value: 250,
    label: "250x",
  },
  {
    value: 300,
    label: "300x",
  },
];

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

function a11yProps(index) {
  return {
    id: `order-tab-${index}`,
    "aria-controls": `order-tabpanel-${index}`,
  };
}

const FuturesOrderForm = ({ assetType, balance }) => {
  const { placeFuturesOrder, isProcessing, futuresCurrentPrices } =
    useTrading();

  const { balances } = useTradingContext();

  const _balance = balances?.futuresUSDTBalance || 10000;

  const [value, setValue] = React.useState(0);

  const [formData, setFormData] = useState({
    market: { amount: "", leverage: "1" },
    limit: { amount: "", leverage: "1", limitPrice: "" },
  });

  const [anchorEl, setAnchorEl] = React.useState(null);

  const currentPrice =
    futuresCurrentPrices.find((p) => p.assetType === assetType)?.price || 0;

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "leverage-popover" : undefined;

  const handleInputChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const validateOrder = (data, type) => {
    const amount = parseFloat(data.amount);
    const leverage = parseFloat(data.leverage);
    const limitPrice =
      type === "limit" ? parseFloat(data.limitPrice) : undefined;

    if (isNaN(amount) || amount <= 0) {
      throw new Error("Please enter a valid amount");
    }

    if (amount > balance) {
      throw new Error("Insufficient balance");
    }

    if (isNaN(leverage) || leverage < 1 || leverage > 300) {
      throw new Error("Leverage must be between 1 and 300");
    }

    if (type === "limit" && (isNaN(limitPrice) || limitPrice <= 0)) {
      throw new Error("Please enter a valid limit price");
    }

    return { amount, leverage, limitPrice };
  };

  const handleSubmit = async (type, positionType) => {
    if (isProcessing) return;

    try {
      const data = formData[type];
      const validatedData = validateOrder(data, type);

      await placeFuturesOrder({
        futuresAssetType: assetType,
        positionType: positionType === "long" ? "Long" : "Short",
        orderType: type,
        ...validatedData,
      });

      // Only clear amount after successful order
      setFormData((prev) => ({
        ...prev,
        [type]: { ...prev[type], amount: "" },
      }));
    } catch (error) {
      alert(error.message);
    }
  };

  const marketMarks = useMemo(
    () => [
      {
        value: 0.2 * _balance,
        label: "20%",
      },
      {
        value: 0.4 * _balance,
        label: "40%",
      },
      {
        value: 0.6 * _balance,
        label: "60%",
      },
      {
        value: 0.8 * _balance,
        label: "80%",
      },
      {
        value: 1.0 * _balance,
        label: "100%",
      },
    ],
    [_balance]
  );

  return (
    <div style={{ flex: 0 }}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab sx={{ color: "white" }} label="Limit" {...a11yProps(0)} />
            <Tab sx={{ color: "white" }} label="Market" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <div className="input-list-group">
            <AvailableUSDTBalance />
            <div className="flex gap-10 flex-col w-full">
              <span style={{ width: 200 }}>
                <label>Margin</label>
                <span className="unit-label">(USDT)</span>
              </span>
              <input
                type="number"
                value={formData.limit.amount}
                onChange={(e) =>
                  handleInputChange("limit", "amount", e.target.value)
                }
                min="1"
                className="amount-input"
                style={{ width: "100%" }}
              />
              <Slider
                aria-label="Default"
                valueLabelDisplay="auto"
                marks={marketMarks}
                min={0}
                max={_balance}
                value={formData.limit.amount}
                onChange={(e, val) => handleInputChange("limit", "amount", val)}
                componentsProps={{ markLabel: { style: { color: "white" } } }}
              />
            </div>
            <div className="flex gap-10 flex-col w-full">
              <span style={{ width: 200 }}>
                <label>Limit Price </label>
                <span className="unit-label">(USDT)</span>
              </span>
              <input
                type="number"
                value={formData.limit.limitPrice}
                onChange={(e) =>
                  handleInputChange("limit", "limitPrice", e.target.value)
                }
                placeholder={currentPrice.toFixed(2)}
                className="price-input flex-1"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <Button
                aria-describedby={id}
                variant="contained"
                onClick={handleClick}
                className="float-right"
                style={{
                  backgroundColor: "#191a1b",
                  border: "1px solid lightgrey",
                }}
              >
                {formData.limit.leverage}x
              </Button>
              <div>Leverage</div>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <div style={{ padding: 12 }}>
                  <input
                    type="number"
                    value={formData.limit.leverage}
                    onChange={(e) =>
                      handleInputChange("limit", "leverage", e.target.value)
                    }
                    className="leverage-input flex-1"
                    style={{ width: "100%" }}
                  />
                  <Slider
                    aria-label="Default"
                    valueLabelDisplay="auto"
                    min={1}
                    max={300}
                    marks={followersMarks}
                    value={formData.limit.leverage}
                    onChange={(e, val) =>
                      handleInputChange("limit", "leverage", val)
                    }
                  />
                </div>
              </Popover>
            </div>
            <div className="button-group gap-10">
              <button
                className="order-button long w-50"
                onClick={() => handleSubmit("limit", "long")}
                disabled={isProcessing}
              >
                Long
              </button>
              <button
                className="order-button short w-50"
                onClick={() => handleSubmit("limit", "short")}
                disabled={isProcessing}
              >
                Short
              </button>
            </div>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <div className="input-list-group">
            <AvailableUSDTBalance />
            <div className="flex gap-10 flex-col w-full">
              <span style={{ width: 200 }}>
                <label>Margin</label>
                <span className="unit-label">(USDT)</span>
              </span>
              <input
                type="number"
                value={formData.market.amount}
                onChange={(e) =>
                  handleInputChange("market", "amount", e.target.value)
                }
                min="1"
                className="amount-input flex-1"
                style={{ width: "100%" }}
              />
              <Slider
                aria-label="Default"
                valueLabelDisplay="auto"
                marks={marketMarks}
                min={0}
                max={_balance}
                value={formData.market.amount}
                onChange={(e, val) =>
                  handleInputChange("market", "amount", val)
                }
                componentsProps={{ markLabel: { style: { color: "white" } } }}
              />
            </div>
            <div>
              <Button
                aria-describedby={id}
                variant="contained"
                onClick={handleClick}
                className="float-right"
                style={{
                  backgroundColor: "#191a1b",
                  border: "1px solid lightgrey",
                }}
              >
                {formData.market.leverage}x
              </Button>
              <div>Leverage</div>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <div style={{ padding: 12 }}>
                  <input
                    type="number"
                    value={formData.market.leverage}
                    onChange={(e) =>
                      handleInputChange("market", "leverage", e.target.value)
                    }
                    className="leverage-input flex-1"
                    style={{ width: "100%" }}
                  />
                  <Slider
                    aria-label="Default"
                    valueLabelDisplay="auto"
                    min={1}
                    max={300}
                    marks={followersMarks}
                    value={formData.market.leverage}
                    onChange={(e, val) =>
                      handleInputChange("market", "leverage", val)
                    }
                  />
                </div>
              </Popover>
            </div>
            <div className="button-group gap-10">
              <button
                className="order-button long w-50"
                onClick={() => handleSubmit("market", "long")}
                disabled={isProcessing}
              >
                Long
              </button>
              <button
                className="order-button short w-50"
                onClick={() => handleSubmit("market", "short")}
                disabled={isProcessing}
              >
                Short
              </button>
            </div>
          </div>
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default memo(FuturesOrderForm);
