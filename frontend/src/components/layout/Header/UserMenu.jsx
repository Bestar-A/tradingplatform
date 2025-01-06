import React, { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const UserMenu = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("#");    
  };

  return (
    <div
      className="user-menu-container"
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <button className="user-menu-trigger">
        <img src="/img/pfp.png" alt="Profile" className="profile-image" />
        <span id="welcome-message-duplicate" className="username">
          {localStorage.getItem("username")}
        </span>
        <img src="/img/arrow-down.png" alt="Arrow" className="arrow-icon" />
      </button>

      {isMenuOpen && (
        <div className="dropdown-menu">
          <div className="profile-section">
            <img
              src="/img/pfp.png"
              alt="Profile"
              className="profile-image-large"
            />
          </div>

          <hr className="menu-separator" />

          <a href="/#" className="menu-item">
            <img src="/img/activity.png" alt="Activity" />
            <span>Activity</span>
          </a>

          <a href="/#" className="menu-item">
            <img src="/img/lock.png" alt="Security" />
            <span>Privacy & security</span>
          </a>

          <a href="/#" className="menu-item">
            <img src="/img/contact.png" alt="Contact" />
            <span>Contact</span>
          </a>

          <button className="menu-item logout-button" onClick={handleLogout}>
            <img src="/img/logout.png" alt="Logout" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(UserMenu);
