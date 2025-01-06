import React, { memo } from "react";
import { useTrading } from "../../../contexts/TradingContext";
import { Tabs, Box, Tab, Button } from "@mui/material";
import AdvancedView from "../../common/Chart/OrderView";
import { useAuth } from "../../../contexts/AuthContext";
import { AssetBalances } from "../../common/Balances/Balances";

const formatPrice = (price) => parseFloat(price).toFixed(2);
const formatNumber = (num) => parseFloat(num).toFixed(8);
const getClosedReason = (reason) => {
  switch (reason) {
    case 0:
      return "by User";
    case 1:
      return "Take Profit";
    case 2:
      return "Stop Loss";
    case 3:
      return "Liquidation";
    case 4:
      return "Partial Close";
    default:
      return "Unknown";
  }
};
const SpotTableRows = (position, isClosedPosition = false) => {
  return position.map((order) => {
    const formattedEntryPrice = formatPrice(order.entryPrice) + " USDT";

    return {
      futures:
        order.orderType +
        " " +
        order.positionType.toUpperCase() +
        " " +
        order.assetType,

      ...(isClosedPosition
        ? {
            entryPrice:
              (order.positionType === "buy" ? "Bought" : "Sold") +
              " at " +
              formattedEntryPrice,
            entry: formattedEntryPrice,
          }
        : {
            price: formattedEntryPrice,
          }),

      amount: formatNumber(order.amount) + " " + order.assetType,

      ...(order.orderType === "limit" && {
        limitPrice: formatPrice(order.limitPrice) + " USDT",
      }),

      ...(isClosedPosition &&
        order.orderLimit !== undefined && {
          closed: getClosedReason(order.orderLimit),
        }),

      id: order.id,
    };
  });
};

const SpotTableColumns = (onClose, isClosedPosition) => {
  const commonColumns = [
    { field: "futures", headerName: "Futures", width: 200 },
    { field: "amount", headerName: "Amount", width: 200 },
    { field: "limitPrice", headerName: "Limit Price", width: 200 },
  ];

  const closedPositionColumns = [
    { field: "entryPrice", headerName: "Entry Price", width: 200 },
    { field: "closed", headerName: "Closed", width: 200 },
  ];

  const openPositionColumns = [
    { field: "price", headerName: "Price", width: 200 },
    {
      field: "action",
      headerName: "Close",
      width: 200,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => onClose(params.row.id)}
        >
          Close
        </Button>
      ),
    },
  ];

  return [
    ...commonColumns,
    ...(!isClosedPosition ? closedPositionColumns : openPositionColumns),
  ];
};

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
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const SpotPositions = () => {
  const { isAuthenticated } = useAuth();

  const {
    spotOpenOrders = [],
    spotClosedPositions = [],
    closePosition,
  } = useTrading();
  console.log(spotOpenOrders);

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleClose = async (orderId) => {
    try {
      await closePosition(orderId, "spot");
    } catch (error) {
      alert("Failed to cancel order: " + error.message);
    }
  };

  return (
    <div className="positions-container app-container">
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab
              sx={{ color: "white" }}
              label="Open Orders"
              {...a11yProps(0)}
            />
            <Tab
              sx={{ color: "white" }}
              label="Trade History"
              {...a11yProps(1)}
            />
            <Tab sx={{ color: "white" }} label="Assets" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          {spotOpenOrders.length > 0 ? (
            <div className="orders-list">
              <AdvancedView
                rows={SpotTableRows(spotOpenOrders)}
                columns={SpotTableColumns(handleClose, true)}
              />
            </div>
          ) : (
            <div className="no-positions">
              <img
                src="/img/nodata.png"
                alt=""
                style={{ width: "150px", height: "150px" }}
              />
              <p>No data</p>
            </div>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {spotClosedPositions.length > 0 ? (
            <div className="closed-position-list">
              <AdvancedView
                rows={SpotTableRows(spotClosedPositions, true)}
                columns={SpotTableColumns(false)}
              />
            </div>
          ) : (
            <div className="no-positions">
              <img
                src="/img/nodata.png"
                alt=""
                style={{ width: "150px", height: "150px" }}
              />
              <p>No data</p>
            </div>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          {isAuthenticated && <AssetBalances list={true} />}
        </CustomTabPanel>
      </Box>

      {/* {spotOpenOrders.length === 0 && spotClosedPositions.length === 0 && (
        <div className="no-positions">
          <p>No positions or orders found</p>
        </div>
      )} */}
    </div>
  );
};

export default memo(SpotPositions);
