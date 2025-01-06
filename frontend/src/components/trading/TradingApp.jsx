import React, { useState, memo } from "react";
import Header from "../layout/Header/Header";
import TransferModal from "../common/Modal/TransferModal";
import DepositModal from "../common/Modal/DepositModal";
import "./styles.css";

const TradingApp = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const handleOpenTransfer = () => setIsTransferModalOpen(true);
  const handleCloseTransfer = () => setIsTransferModalOpen(false);
  const handleOpenDeposit = () => setIsDepositModalOpen(true);
  const handleCloseDeposit = () => setIsDepositModalOpen(false);

  return (
    <div>
      <Header
        onOpenTransfer={handleOpenTransfer}
        onOpenDeposit={handleOpenDeposit}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransfer}
      />

      <DepositModal isOpen={isDepositModalOpen} onClose={handleCloseDeposit} />
    </div>
  );
};

export default memo(TradingApp);
