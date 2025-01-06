import React, { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import useTrading from "../../../hooks/useTrading";
import { useAuth } from "../../../contexts/AuthContext";
import "./PNICard.css";

const PNICard = ({ position, onClose }) => {
  const ref = useRef();
  const { futuresCurrentPrices } = useTrading();
  const { username } = useAuth();
  const currentPrice = futuresCurrentPrices.find(
    (p) => p.assetType === position.future.split(" ")[1]
  )?.price;

  const handleDownload = useCallback(() => {
    if (ref.current === null) {
      return;
    }

    toPng(ref.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "my-image-name.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }, [ref]);

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ zIndex: 1 }}>
        <div className="modal-header">
          <h2>Show PNI Card</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div
          className="modal-content"
          style={{ padding: "20px", overflow: "hidden" }}
          ref={ref}
        >
          <img
            src="/img/MEXC_POSTER.png"
            alt="MEXC_POSTER"
            style={{
              width: "100%",
              zIndex: -3,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <div className="card-info">
            <span className="text-white float-right text-grey">{username}</span>
            <span className="text-white">Logo</span>
            <span className="text-10 text-white mt-30">TRX USDT Perpetual</span>
            <span className="text-10">
              <span className="text-green" style={{ display: "inline" }}>
                {position.future.split(" ")[0]}
              </span>{" "}
              <span style={{ display: "inline" }}>/ {position.leverage}x</span>
            </span>
            <span
              className={`text-20 text-${position.roi < 0 ? "red" : "green"}`}
            >
              {position.roi}%
            </span>
            <span
              className={`text-10 text-${position.roi < 0 ? "red" : "green"}`}
            >
              {position.unrealizedPnl}
            </span>
            <table className="mt-30 text-grey text-8">
              <tr>
                <td>Avg Entry Price</td>
                <td className="text-white">${position.entry}</td>
              </tr>
              <tr>
                <td>Fair Price</td>
                <td className="text-white">${currentPrice}</td>
              </tr>
            </table>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleDownload} className="submit-button">
            Download
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PNICard;
