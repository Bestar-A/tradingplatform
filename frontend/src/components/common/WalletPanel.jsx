import React, { useState, memo } from "react";
import { Box, Alert } from "@mui/material";
import useTrading from "../../hooks/useTrading";
import TransferModal from "./Modal/TransferModal";
import DepositModal from "./Modal/DepositModal";
import {
  FuturesUSDTBalance,
  FuturesValueBalance,
  SpotUSDTBalance,
  SpotValueBalance,
} from "./Balances/Balances";

const WalletPanel = ({ assetType, balance }) => {
  const { isProcessing } = useTrading();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const handleOpenTransfer = () => setIsTransferModalOpen(true);
  const handleCloseTransfer = () => setIsTransferModalOpen(false);
  const handleOpenDeposit = () => setIsDepositModalOpen(true);
  const handleCloseDeposit = () => setIsDepositModalOpen(false);

  return (
    <div className="order-panel gap-0">
      <Box sx={{ width: "100%" }}>
        <Box style={{ padding: 24 }}>
          <span>Wallet</span>
          <div className="button-group gap-10 mt-10">
            <button
              className="round-button deposit long w-50"
              onClick={handleOpenDeposit}
              disabled={isProcessing}
            >
              Deposit
            </button>
            <button
              className="round-button transfer short w-50"
              onClick={handleOpenTransfer}
              disabled={isProcessing}
            >
              Transfer
            </button>
          </div>
          <Alert variant="filled" severity="info" className="mt-10">
            Transfer funds to futures wallet and start futures trading now.
          </Alert>
          <div className="mt-10">
            <FuturesUSDTBalance />
          </div>
          <div className="mt-10">
            <FuturesValueBalance />
          </div>
          <div className="mt-10">
            <SpotUSDTBalance />
          </div>
          <div className="mt-10">
            <SpotValueBalance />
          </div>
        </Box>
      </Box>
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransfer}
      />

      <DepositModal isOpen={isDepositModalOpen} onClose={handleCloseDeposit} />
    </div>
  );
};

export default memo(WalletPanel);
