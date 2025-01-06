import React from "react";
import "./styles.css";
import { NavLink } from "react-router-dom";

const AuthHeader = () => {
  return (
    <div className="main-header">
      <div className="nav-left">
        <NavLink to="/guest_future" className="tab-item">
          Futures Trading
        </NavLink>
        <NavLink to="/guest_spot" className="tab-item">
          Spot Trading
        </NavLink>
      </div>
      <div className="nav-right">
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </div>
    </div>
  );
};

export default AuthHeader;
