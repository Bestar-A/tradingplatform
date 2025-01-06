import React, { useState, memo } from "react";
import "./styles.css";

const NetworkSelector = ({ networks, selectedNetwork, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatLabel = (label) => label || "Select Network";

  const renderNetworkOption = (network) => {
    if (!network) return null;

    return (
      <div className="dropdown-option" key={network.label}>
        <span className="network-icon-small">
          <img
            src={`/img/${network.icon}`}
            style={{ width: "48px", height: "48px" }}
            alt={network.label}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/img/default.png"; // Fallback image
            }}
          />
        </span>
        <span className="network-label">{network.label}</span>
      </div>
    );
  };

  const renderSelectedNetwork = () => {
    const network = networks.find((n) => n.label === selectedNetwork);

    if (!network) {
      return (
        <div className="selected-network-default">
          <span className="network-icon-large">
            <img
              src="/img/default.png"
              alt="default"
              style={{ width: "48px", height: "48px" }}
            />
          </span>
          <span className="network-label">{formatLabel(selectedNetwork)}</span>
        </div>
      );
    }

    return (
      <div className="selected-network">
        <span className="network-icon-large">
          <img
            src={`/img/${network.icon}`}
            style={{ width: "48px", height: "48px" }}
            alt={network.label}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/img/default.png";
            }}
          />
        </span>
        <span className="network-label">{network.label}</span>
      </div>
    );
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (networkLabel) => {
    onSelect(networkLabel);
    setIsOpen(false);
  };

  return (
    <div className="custom-dropdown">
      <div
        className="custom-dropdown-selected"
        onClick={toggleDropdown}
      >
        {renderSelectedNetwork()}
      </div>

      {isOpen && (
        <div className="custom-dropdown-options">
          {networks
            .filter((network) => network.label !== selectedNetwork)
            .map((network) => (
              <div
                key={network.label}
                onClick={() => handleSelect(network.label)}
              >
                {renderNetworkOption(network)}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default memo(NetworkSelector);