import { tradingAPI } from "./api";

export const calculateUnrealizedPL = (
  entryPrice,
  currentPrice,
  amount,
  leverage,
  positionType
) => {
  const priceDifference = (currentPrice - entryPrice) / entryPrice;
  const profitLoss =
    positionType === "Long"
      ? amount * priceDifference
      : amount * -priceDifference;
  return profitLoss * leverage;
};

export const calculateROI = (
  entryPrice,
  currentPrice,
  amount,
  leverage,
  positionType
) => {
  // Validate inputs
  if (entryPrice <= 0 || currentPrice < 0 || leverage <= 0) {
    throw new Error(
      "All values must be positive and entryPrice must be greater than 0."
    );
  }

  // Calculate unrealized profit and loss
  const unrealizedPL = calculateUnrealizedPL(
    entryPrice,
    currentPrice,
    amount,
    leverage,
    positionType
  );

  // Calculate total investment
  const totalInvestment = entryPrice * leverage;

  // Calculate ROI
  const ROI = (unrealizedPL / totalInvestment) * 100; // ROI as a percentage

  return ROI;
};

export const fetchCurrentPrices = async (accountType) => {
  try {
    const response = await tradingAPI.getCurrentPrices(accountType);
    return response.currentPrices || [];
  } catch (error) {
    console.error(`Error fetching ${accountType} prices:`, error);
    return [];
  }
};

export const fetchUserPositions = async () => {
  try {
    const response = await tradingAPI.getPositions();
    return response;
  } catch (error) {
    console.error("Error fetching positions:", error);
    return {
      futuresPositions: [],
      spotPositions: [],
      openOrders: [],
    };
  }
};

export const tradingService = {
  openFuturesPosition: async (positionData) => {
    try {
      const response = await tradingAPI.openFuturesPosition(positionData);
      return response;
    } catch (error) {
      throw new Error(error.response.data || "Failed to open futures position");
    }
  },

  startTrade: async (positionId) => {
    try {
      console.log("starttrade", positionId);
      const response = await tradingAPI.startTrade(positionId);
      return response;
    } catch (error) {
      throw new Error("Failed to start trade");
    }
  },

  closeFuturesPosition: async (positionId, reason) => {
    try {
      console.log("futureclose", positionId);
      const response = await tradingAPI.closeFuturesPosition(
        positionId,
        reason
      );
      return response;
    } catch (error) {
      throw new Error("Failed to close futures position");
    }
  },

  openSpotPosition: async (positionData) => {
    try {
      const response = await tradingAPI.openSpotPosition(positionData);
      return response;
    } catch (error) {
      throw new Error("Failed to open spot position");
    }
  },

  closeSpotPosition: async (positionId) => {
    try {
      const response = await tradingAPI.closeSpotPosition(positionId);
      return response;
    } catch (error) {
      throw new Error("Failed to close spot position");
    }
  },

  saveTPSL: async (positionId, tp, sl) => {
    try {
      const response = await tradingAPI.saveTPSL(positionId, tp, sl);
      return response;
    } catch (error) {
      throw new Error("Failed to save TP/SL");
    }
  },

  partialClosePosition: async (positionId, percent) => {
    try {
      const response = await tradingAPI.closePatialsPosition(
        positionId,
        percent
      );
      return response;
    } catch (error) {
      throw new Error("Failed to partially close position");
    }
  },
};

export default tradingService;
