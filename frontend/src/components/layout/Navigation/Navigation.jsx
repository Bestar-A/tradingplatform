import React, { memo } from "react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="tab">
      {/* <NavLink
        to="/dashboard"
        className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}
      >
        Dashboard
      </NavLink> */}

      <NavLink
        to="/future"
        className="tab-item"
      >
        Futures Trading
      </NavLink>

      <NavLink
        to="/spot"
        className="tab-item"
      >
        Spot Trading
      </NavLink>
    </nav>
  );
};

export default memo(Navigation);
