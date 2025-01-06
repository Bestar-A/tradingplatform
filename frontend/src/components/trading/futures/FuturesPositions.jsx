import React, { memo, useState } from "react";
import { useTrading } from "../../../contexts/TradingContext";
import PartialCloseModal from "../../common/Modal/PartialCloseModal";
import PNICard from "../../common/Modal/PNICard";
import { Tabs, Box, Tab } from "@mui/material";
import "./styles.css";
import AdvancedView from "../../common/Chart/OrderView";
import TPSLCell from "../../common/TSPCell";
import PNICell from "../../common/PNICell";
import { calculateROI } from "../../../services/tradingService";

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

const FuturesPositions = () => {
  const {
    futuresPositions = [],
    futuresOpenOrders = [],
    futuresClosedPositions = [],
    saveTPSL,
    closePosition,
  } = useTrading();

  const getClosedReason = (reason) => {
    switch (reason) {
      case 0:
        return "Manual";
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
  const { calculateUnrealizedPL, futuresCurrentPrices } = useTrading();

  const UnrealizedPL = (position) => {
    console.log("MyPos", position.closedAmount);
    const currentPrice = futuresCurrentPrices.find(
      (p) => p.assetType === position.assetType
    )?.price;

    const unrealizedPL = currentPrice
      ? calculateUnrealizedPL(
          position.entryPrice,
          currentPrice,
          position.amount,
          position.leverage,
          position.positionType
        )
      : 0;
    return parseFloat(unrealizedPL).toFixed(2);
  };

  const RealizedPL = (position) => {
    const currentPrice = futuresCurrentPrices.find(
      (p) => p.assetType === position.assetType
    )?.price;

    const realizedPL = currentPrice
      ? calculateUnrealizedPL(
          position.entryPrice,
          currentPrice,
          position?.closedAmount || 0,
          position.leverage,
          position.positionType
        )
      : 0;
    return parseFloat(realizedPL).toFixed(2);
  };

  const ROI = (position) => {
    const currentPrice = futuresCurrentPrices.find(
      (p) => p.assetType === position.assetType
    )?.price;

    const roi = currentPrice
      ? calculateROI(
          position.entryPrice,
          currentPrice,
          position.amount,
          position.leverage,
          position.positionType
        )
      : 0;
    return parseFloat(roi).toFixed(2);
  };

  const positionsTable = (value) => {
    return value.reverse().map((pos) => ({
      future: pos.positionType + " " + pos.assetType,
      realizedPL:
        value === futuresClosedPositions
          ? parseFloat(pos.realizedPL).toFixed(2)
          : RealizedPL(pos) + " USD",
      limitPrice: pos.limitPrice,
      // value === futuresClosedPositions
      //   ? parseFloat(pos.realizedPL).toFixed(2)
      //   : UnrealizedPL(pos) + " USD",
      unrealizedPnl:
        value === futuresClosedPositions
          ? parseFloat(pos.realizedPL).toFixed(2)
          : UnrealizedPL(pos) + " USD",
      roi: ROI(pos),
      amount: parseFloat(pos.amount).toFixed(2),
      leverage: pos.leverage,
      entry: pos.entryPrice,
      ...(value === futuresClosedPositions && {
        exit: `${pos.exitPrice}`,
        closedby: getClosedReason(pos.closedReason),
        perpetual: parseFloat(
          ((pos.exitPrice - pos.entryPrice) * pos.leverage * 100) /
            pos.entryPrice
        ).toFixed(2),
      }),
      ...(value !== futuresClosedPositions && {
        tp: pos.tp,
        sl: pos.sl,
      }),
      liquidation:
        pos.positionType === "Short"
          ? parseFloat(
              (pos.entryPrice * (125 + pos.leverage / 100)) / 125
            ).toFixed(2)
          : parseFloat(
              (pos.entryPrice * (125 - 100 / pos.leverage)) / 125
            ).toFixed(2),
      id: pos.id,
    }));
  };

  const positionColumns = (value, isOrder = 0) => {
    const columns = [
      { field: "future", headerName: "TradingPair", width: 200 },

      { field: "amount", headerName: "Margin", type: "number", width: 140 },
      {
        field: "leverage",
        headerName: "Leverage",
        type: "number",
        width: 100,
      },
      { field: "entry", headerName: "Entry Price", type: "number", width: 130 },
      ...(value === futuresClosedPositions
        ? [
            {
              field: "exit",
              headerName: "Fair Price",
              type: "number",
              width: 130,
            },
            {
              field: "closedby",
              headerName: "Status",
              width: 150,
              type: "number",
            },
          ]
        : []),
      {
        field: "liquidation",
        headerName: "Est. Liq Price",
        width: 150,
        type: "number",
      },

      ...(value !== futuresClosedPositions
        ? [
            {
              field: "action",
              headerName: " TP/SL",
              width: 430,

              renderCell: (params) => (
                <TPSLCell
                  row={params.row}
                  onSave={(id, tp, sl) => handleSaveTPSL(id, tp, sl)}
                  onClose={handleClose}
                />
              ),
            },
          ]
        : []),
    ];

    if (isOrder === 2) {
      columns.splice(1, 0, {
        field: "unrealizedPnl",
        headerName: "Unrealized PNL",
        type: "number",
        width: 150,
        renderCell: (params) => (
          <PNICell row={params.row} onOpen={handleShowPNICard} />
        ),
      });

      columns.splice(5, 0, {
        field: "realizedPL",
        headerName: "Realized PL",
        type: "number",
        width: 150,
        renderCell: (params) => (
          <span
            className={`text-${
              parseFloat(params.row.realizedPL.split(" ")[0]).toFixed(2) < 0
                ? "red"
                : "green"
            }`}
          >
            {parseFloat(params.row.realizedPL.split(" ")[0]).toFixed(2)} USD
          </span>
        ),
      });
    }

    if (isOrder === 1) {
      columns.splice(3, 1, {
        field: "limitPrice",
        headerName: "Limit Price",
        type: "number",
        width: 150,
      });
    }

    if (!isOrder) {
      columns.splice(5, 0, {
        field: "realizedPL",
        headerName: "Realized PL",
        type: "number",
        width: 150,
        renderCell: (params) => (
          <>{parseFloat(params.row.realizedPL.split(" ")[0]).toFixed(2)}</>
        ),
      });
    }

    return columns;
  };

  const [showPartialCloseModal, setShowPartialCloseModal] = useState(false);
  const [showPNICard, setShowPNICard] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(false);
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClose = async (position) => {
    try {
      if (position.unrealizedPnl === 1) {
        await closePosition(position.id, "futures");
      } else {
        setSelectedPosition(position);
        setShowPartialCloseModal(true);
      }
    } catch (error) {
      alert("Failed to close position: " + error.message);
    }
  };

  const handleSaveTPSL = async (positionId, tp, sl) => {
    try {
      await saveTPSL(positionId, tp, sl);
    } catch (error) {
      alert("Failed to save TP/SL: " + error.message);
    }
  };

  const handleShowPNICard = (position) => {
    setSelectedPosition(position);
    setShowPNICard(true);
  };

  return (
    <div className="positions-container app-container flex-1">
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab
              sx={{ color: "white" }}
              label="Open Position"
              {...a11yProps(0)}
            />
            <Tab
              sx={{ color: "white" }}
              label="Open Orders"
              {...a11yProps(1)}
            />
            <Tab
              sx={{ color: "white" }}
              label="Position History"
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          {futuresPositions.length > 0 ? (
            <>
              <div className="positions-list">
                <AdvancedView
                  rows={positionsTable(futuresPositions)}
                  columns={positionColumns(futuresPositions, 2)}
                />
              </div>
            </>
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
          {futuresOpenOrders.length > 0 ? (
            <>
              <div className="orders-list">
                <AdvancedView
                  rows={positionsTable(futuresOpenOrders)}
                  columns={positionColumns(futuresOpenOrders, 1)}
                />
              </div>
            </>
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
          {futuresClosedPositions.length > 0 ? (
            <div className="closed-positions-list">
              <AdvancedView
                rows={positionsTable(futuresClosedPositions)}
                columns={positionColumns(futuresClosedPositions)}
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
      </Box>
      {/* {futuresPositions.length === 0 &&
        futuresOpenOrders.length === 0 &&
        futuresClosedPositions.length === 0 && (
          <div className="no-positions">
            <p>No positions found</p>
          </div>
        )} */}
      {showPartialCloseModal && (
        <PartialCloseModal
          position={selectedPosition}
          onClose={() => setShowPartialCloseModal(false)}
        />
      )}
      {showPNICard && (
        <PNICard
          position={selectedPosition}
          onClose={() => setShowPNICard(false)}
        />
      )}
    </div>
  );
};

export default memo(FuturesPositions);
