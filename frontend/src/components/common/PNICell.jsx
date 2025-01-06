import React from "react";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";

export default function PNICell({ row, onOpen = () => {} }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          lineHeight: 1.7,
          float: "right",
          flexDirection: "row",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            flexDirection: "column",
          }}
        >
          <div
            className={`text-${
              parseFloat(row.unrealizedPnl.split(" ")[0]) < 0 ? "red" : "green"
            }`}
          >
            {row.unrealizedPnl}
          </div>
          <div
            className={`text-${
              parseFloat(row.unrealizedPnl.split(" ")[0]) < 0 ? "red" : "green"
            }`}
          >
            {row.roi}
          </div>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <PriceCheckIcon onClick={() => onOpen(row)} />
        </div>
      </div>
    </>
  );
}
