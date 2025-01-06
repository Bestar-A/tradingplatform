import React, { useState } from "react";

export default function TPSLCell({ row, onSave, onClose }) {
  
  const [tp, setTp] = useState(row.tp || "");
  const [sl, setSl] = useState(row.sl || "");

  const handleSave = () => {
    onSave(row.id, tp, sl);
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <div className="input-group" style={{ maxWidth: "200px" }}>
        <label>TP</label>
        <input
          type="number"
          value={tp}
          onChange={(e) => setTp(e.target.value)}
          placeholder="Take Profit"
          style={{ maxWidth: "130px" }}
        />
      </div>
      <div className="input-group" style={{ maxWidth: "100px" }}>
        <label>SL</label>
        <input
          type="number"
          value={sl}
          onChange={(e) => setSl(e.target.value)}
          placeholder="Stop Loss"
          style={{ maxWidth: "70px" }}
        />
      </div>
      <button className="order-button" style={{padding: '7px 10px', height: 'max-content', background: '#0f6ccf', color: 'white'}} onClick={handleSave}>
        Save
      </button>
      <button className="order-button" style={{padding: '7px 10px', height: 'max-content', background: '#d32f2f', color: 'white'}} onClick={() => onClose(row)}>
        Close
      </button>
    </div>
  );
}
