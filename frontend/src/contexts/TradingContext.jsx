import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { tradingAPI, walletAPI } from "../services/api";
import {
  fetchCurrentPrices,
  fetchUserPositions,
  calculateUnrealizedPL,
  tradingService,
  calculateROI,
} from "../services/tradingService";

const DEFAULT_ASSETS = [
  "BTC",
  "ETH",
  "BNB",
  "POPCAT",
  "PONKE",
  "NEO",
  "LTC",
  "SOL",
  "XRP",
  "DOT",
  "PEOPLE",
  "NAVX",
];

const DEFAULT_PRICES = DEFAULT_ASSETS.map((asset) => ({
  assetType: asset,
  price: asset === "BTC" ? 65000 : asset === "ETH" ? 3500 : 100,
  percent: 0,
}));

const DEFAULT_BALANCES = {
  futuresUSDTBalance: 0,
  spotUSDTBalance: 0,
  spotBalances: DEFAULT_ASSETS.reduce((acc, asset) => {
    acc[asset] = 0;
    return acc;
  }, {}),
};

const DEFAULT_USER_DATA = {
  username: "",
  address: "",
  balance: 0,
};

const TradingContext = createContext(null);

export const TradingProvider = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [futuresAssetType, setFuturesAssetType] = useState("BTC");
  const [spotAssetType, setSpotAssetType] = useState("BTC");
  const [futuresPositions, setFuturesPositions] = useState([]);
  const [futuresOpenOrders, setFuturesOpenOrders] = useState([]);
  const [futuresClosedPositions, setFuturesClosedPositions] = useState([]);
  const [spotOpenOrders, setSpotOpenOrders] = useState([]);
  const [spotClosedPositions, setSpotClosedPositions] = useState([]);
  const [futuresCurrentPrices, setFuturesCurrentPrices] =
    useState(DEFAULT_PRICES);
  const [spotCurrentPrices, setSpotCurrentPrices] = useState(DEFAULT_PRICES);
  const [balances, setBalances] = useState(DEFAULT_BALANCES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(DEFAULT_USER_DATA);

  // Refs for async operations
  const balancesRef = useRef(balances);
  const futuresPositionsRef = useRef(futuresPositions);
  const spotPositionsRef = useRef([]);
  const futuresCurrentPricesRef = useRef(futuresCurrentPrices);
  const spotCurrentPricesRef = useRef(spotCurrentPrices);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    balancesRef.current = balances;
    futuresPositionsRef.current = futuresPositions;
    futuresCurrentPricesRef.current = futuresCurrentPrices;
    spotCurrentPricesRef.current = spotCurrentPrices;
  }, [balances, futuresPositions, futuresCurrentPrices, spotCurrentPrices]);

  const fetchUserData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await tradingAPI.getBalance();
      setUserData({
        username: response.username,
        address: response.address,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data");
      if (error.status === 403) logout();
    } finally {
      setIsLoading(false);
    }
  };

  const transformPriceData = (prices) => {
    if (!Array.isArray(prices) || prices.length === 0) return DEFAULT_PRICES;

    return DEFAULT_ASSETS.map((asset) => {
      const priceData = prices.find((p) => p.assetType === asset);
      if (priceData) {
        return {
          ...priceData,
          price:
            Number(priceData.price) ||
            DEFAULT_PRICES.find((p) => p.assetType === asset)?.price ||
            0,
          percent: Number(priceData.percent) || 0,
        };
      }
      return (
        DEFAULT_PRICES.find((p) => p.assetType === asset) || {
          assetType: asset,
          price: 0,
          percent: 0,
        }
      );
    });
  };

  const updateBalances = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await walletAPI.getBalance();
      if (response.ok) {
        const newBalances = {
          futuresUSDTBalance:
            response.futuresUSDTBalance || DEFAULT_BALANCES.futuresUSDTBalance,
          spotUSDTBalance:
            response.spotUSDTBalance || DEFAULT_BALANCES.spotUSDTBalance,
          spotBalances: DEFAULT_ASSETS.reduce((acc, asset) => {
            acc[asset] = 0;
            const positions = spotPositionsRef.current.filter(
              (p) => p.assetType === asset && p.orderLimit === 0
            );
            positions.forEach((position) => {
              if (position.positionType === "buy") {
                acc[asset] += parseFloat(position.amount);
              } else if (position.positionType === "sell") {
                acc[asset] -= parseFloat(position.amount);
              }
            });
            return acc;
          }, {}),
        };
        setBalances(newBalances);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const updatePrices = async () => {
    try {
      const [futuresPrices, spotPrices] = await Promise.all([
        fetchCurrentPrices("futures"),
        fetchCurrentPrices("spot"),
      ]);

      if (!futuresPrices || !spotPrices) {
        const simulatedPrices = DEFAULT_PRICES.map((price) => ({
          ...price,
          price: price.price * (1 + (Math.random() - 0.5) * 0.001),
          percent: (Math.random() - 0.5) * 2,
        }));
        setFuturesCurrentPrices(simulatedPrices);
        setSpotCurrentPrices(simulatedPrices);
        return;
      }

      setFuturesCurrentPrices(transformPriceData(futuresPrices));
      setSpotCurrentPrices(transformPriceData(spotPrices));
    } catch (error) {
      console.error("Error fetching prices:", error);
      const simulatedPrices = DEFAULT_PRICES.map((price) => ({
        ...price,
        price: price.price * (1 + (Math.random() - 0.5) * 0.001),
        percent: (Math.random() - 0.5) * 2,
      }));
      setFuturesCurrentPrices(simulatedPrices);
      setSpotCurrentPrices(simulatedPrices);
    }
  };

  const transferBalance = async (fromAccount, toAccount, amount) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await tradingAPI.post("/balance/transfer", {
        fromAccount,
        toAccount,
        amount,
      });

      if (response.ok) {
        setBalances((prev) => ({
          ...prev,
          futuresUSDTBalance:
            response.futuresUSDTBalance || prev.futuresUSDTBalance,
          spotUSDTBalance: response.spotUSDTBalance || prev.spotUSDTBalance,
        }));
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePositions = async () => {
    if (!isAuthenticated || isProcessingRef.current) return;

    try {
      isProcessingRef.current = true;
      const positions = await fetchUserPositions();

      // Process futures positions first
      const futuresUpdates = positions.futuresPositions.map(
        async (position) => {
          const currentPrice = futuresCurrentPricesRef.current.find(
            (p) => p.assetType === position.assetType
          )?.price;

          if (!currentPrice) return position;

          if (
            position.orderLimit === 1 &&
            shouldStartTrade(position, currentPrice)
          ) {
            await tradingService.startTrade(position.id);
            return { ...position, orderLimit: 0 };
          }

          if (
            position.orderLimit === 0 &&
            !(
              currentPrice ===
              DEFAULT_PRICES.find(
                (price) => price.assetType === position.assetType
              )?.price
            )
          ) {
            const unrealizedPL = calculateUnrealizedPL(
              position.entryPrice,
              currentPrice,
              position.amount,
              position.leverage,
              position.positionType
            );

            if (shouldLiquidate(position, unrealizedPL)) {
              await closePosition(position.id, "futures", 3);
              return null;
            }

            if (shouldTakeProfit(position, currentPrice)) {
              await closePosition(position.id, "futures", 1);
              return null;
            }

            if (shouldStopLoss(position, currentPrice)) {
              await closePosition(position.id, "futures", 2);
              return null;
            }
          }

          return position;
        }
      );

      const processedFuturesPositions = (
        await Promise.all(futuresUpdates)
      ).filter(Boolean);

      // Update states atomically
      setFuturesPositions(
        processedFuturesPositions.filter((p) => p.orderLimit === 0)
      );
      setFuturesOpenOrders(
        processedFuturesPositions.filter((p) => p.orderLimit === 1)
      );
      setFuturesClosedPositions(positions.closedFuturesPositions || []);

      // Process spot positions
      const processedSpotPositions = await Promise.all(
        positions.spotPositions.map(async (position) => {
          if (position.orderLimit === 1) {
            const currentPrice = spotCurrentPricesRef.current.find(
              (p) => p.assetType === position.assetType
            )?.price;

            if (
              currentPrice &&
              shouldExecuteSpotLimit(position, currentPrice)
            ) {
              await tradingService.executeSpotLimitOrder(position.id);
              return { ...position, orderLimit: 0 };
            }
          }
          return position;
        })
      );

      spotPositionsRef.current = processedSpotPositions;
      setSpotOpenOrders(
        processedSpotPositions.filter((p) => p.orderLimit === 1)
      );
      setSpotClosedPositions(
        processedSpotPositions.filter((p) => p.orderLimit === 0)
      );
    } catch (error) {
      console.error("Error updating positions:", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const shouldExecuteSpotLimit = (position, currentPrice) => {
    return (
      (position.positionType === "buy" &&
        position.limitPrice >= currentPrice) ||
      (position.positionType === "sell" && position.limitPrice <= currentPrice)
    );
  };

  const shouldStartTrade = (position, currentPrice) =>
    (position.positionType === "Long" && position.limitPrice >= currentPrice) ||
    (position.positionType === "Short" && position.limitPrice <= currentPrice);

  const shouldLiquidate = (position, unrealizedPL) =>
    Math.abs(unrealizedPL) >= position.amount * 0.8;

  const shouldTakeProfit = (position, currentPrice) =>
    position.tp > 0 &&
    position.tp !== 100000000 &&
    ((position.positionType === "Long" && currentPrice >= position.tp) ||
      (position.positionType === "Short" && currentPrice <= position.tp));

  const shouldStopLoss = (position, currentPrice) =>
    position.sl > 0 &&
    position.sl !== 100000000 &&
    ((position.positionType === "Long" && currentPrice <= position.sl) ||
      (position.positionType === "Short" && currentPrice >= position.sl));

  const calculateTotalValue = () => {
    const currentBalances = balancesRef.current;
    let totalValue =
      currentBalances.spotUSDTBalance + currentBalances.futuresUSDTBalance;

    // Add spot balance values
    Object.entries(currentBalances.spotBalances).forEach(([asset, amount]) => {
      const price =
        spotCurrentPricesRef.current.find((p) => p.assetType === asset)
          ?.price || 0;
      totalValue += amount * price;
    });

    // Add futures positions value and unrealized PL
    futuresPositionsRef.current.forEach((position) => {
      if (position.orderLimit !== 0) return;

      const currentPrice = futuresCurrentPricesRef.current.find(
        (p) => p.assetType === position.assetType
      )?.price;

      if (currentPrice) {
        totalValue += position.amount;
        const unrealizedPL = calculateUnrealizedPL(
          position.entryPrice,
          currentPrice,
          position.amount,
          position.leverage,
          position.positionType
        );
        totalValue += unrealizedPL;
      }
    });

    return totalValue;
  };

  const validateWithdrawal = (asset, amount) => {
    if (!amount || amount <= 0) {
      throw new Error("Invalid withdrawal amount");
    }

    const currentBalances = balancesRef.current;
    let availableBalance = 0;

    if (asset === "USDT") {
      availableBalance = currentBalances.spotUSDTBalance;
    } else {
      availableBalance = currentBalances.spotBalances[asset] || 0;
    }

    if (amount > availableBalance) {
      throw new Error(`Insufficient ${asset} balance`);
    }

    return true;
  };

  const withdrawFunds = async ({ asset, network, amount, address }) => {
    if (!isAuthenticated) return;
    setIsLoading(true);

    try {
      validateWithdrawal(asset, amount);

      if (network === "ERC-20" && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error("Invalid ERC-20 address format");
      }

      const response = await tradingAPI.withdrawRequest(
        asset,
        network,
        address,
        amount
      );

      if (!response.ok) {
        throw new Error(response.message || "Withdrawal request failed");
      }

      // Update balances after successful withdrawal
      setBalances((prev) => {
        const newBalances = { ...prev };
        if (asset === "USDT") {
          newBalances.spotUSDTBalance -= amount;
        } else {
          newBalances.spotBalances = {
            ...newBalances.spotBalances,
            [asset]: (newBalances.spotBalances[asset] || 0) - amount,
          };
        }
        return newBalances;
      });

      return {
        success: true,
        message: `Successfully submitted withdrawal request for ${amount} ${asset} via ${network}`,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const placeFuturesOrder = async (orderData) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      validateFuturesOrder(orderData);
      const response = await tradingService.openFuturesPosition(orderData);
      await updatePositions();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const validateFuturesOrder = (orderData) => {
    const { amount, leverage, limitPrice } = orderData;
    const currentBalance = balancesRef.current.futuresUSDTBalance;

    if (!amount || amount <= 0) throw new Error("Invalid order amount");
    if (!leverage || leverage < 1 || leverage > 300)
      throw new Error("Invalid leverage value");
    if (amount > currentBalance) throw new Error("Insufficient balance");
    if (orderData.orderType === "limit" && (!limitPrice || limitPrice <= 0)) {
      throw new Error("Invalid limit price");
    }

    return true;
  };

  const placeSpotOrder = async (orderData) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await validateSpotOrder(orderData);
      const response = await tradingService.openSpotPosition(orderData);
      await updatePositions();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const validateSpotOrder = async (orderData) => {
    const { amount, assetType, positionType, limitPrice } = orderData;
    const currentBalances = balancesRef.current;
    const currentPrices = spotCurrentPricesRef.current;

    if (!amount || amount <= 0) throw new Error("Invalid order amount");

    const assetPrice = currentPrices.find(
      (p) => p.assetType === assetType
    )?.price;
    if (!assetPrice) throw new Error("Price not available");

    if (positionType === "buy") {
      const requiredBalance = amount * assetPrice;
      if (requiredBalance > currentBalances.spotUSDTBalance) {
        throw new Error("Insufficient USDT balance");
      }
    } else {
      const availableAsset = currentBalances.spotBalances[assetType] || 0;
      if (amount > availableAsset) {
        throw new Error(`Insufficient ${assetType} balance`);
      }
    }

    if (orderData.orderType === "limit" && (!limitPrice || limitPrice <= 0)) {
      throw new Error("Invalid limit price");
    }

    return true;
  };

  const closePosition = async (positionId, type, reason = 0) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    console.log(positionId, type, reason);

    try {
      if (type === "futures") {
        await tradingService.closeFuturesPosition(positionId, reason);
      } else {
        await tradingService.closeSpotPosition(positionId);
      }
      await updatePositions();
      await updateBalances();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const partialClosePosition = async (positionId, percent) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      if (!percent || percent <= 0 || percent > 100) {
        throw new Error("Invalid closing percentage");
      }
      await tradingService.partialClosePosition(positionId, percent);
      await updatePositions();
      await updateBalances();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveTPSL = async (positionId, tp, sl) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      if ((tp && tp <= 0) || (sl && sl <= 0)) {
        throw new Error("Invalid TP/SL values");
      }
      await tradingService.saveTPSL(positionId, tp, sl);
      await updatePositions();
      alert("TP/SL saved successfully");
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async () => {
    await Promise.all([updatePrices(), updateBalances(), updatePositions()]);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const initialize = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            updatePrices(),
            fetchUserData(),
            updateBalances(),
            updatePositions(),
          ]);
        } catch (error) {
          console.error("Error initializing:", error);
          setError("Failed to initialize trading data");
        } finally {
          setIsLoading(false);
        }
      };

      initialize();

      const dataInterval = setInterval(updateData, 3000);

      return () => {
        clearInterval(dataInterval);
      };
    } else {
      const initialize = async () => {
        setIsLoading(true);
        try {
          await Promise.all([updatePrices()]);
        } catch (error) {
          console.error("Error initializing:", error);
          setError("Failed to initialize trading data");
        } finally {
          setIsLoading(false);
        }
      };

      initialize();
      setFuturesClosedPositions([]);
      setFuturesOpenOrders([]);
      setFuturesPositions([]);
      const dataInterval = setInterval(updateData, 3000);

      return () => {
        clearInterval(dataInterval);
      };
    }
  }, [isAuthenticated]);

  const value = {
    futuresAssetType,
    setFuturesAssetType,
    spotAssetType,
    setSpotAssetType,
    futuresPositions,
    futuresOpenOrders,
    futuresClosedPositions,
    spotOpenOrders,
    spotClosedPositions,
    futuresCurrentPrices,
    spotCurrentPrices,
    balances,
    isLoading,
    error,
    userData,
    placeFuturesOrder,
    placeSpotOrder,
    closePosition,
    partialClosePosition,
    saveTPSL,
    transferBalance,
    withdrawFunds,
    updatePositions,
    updatePrices,
    updateBalances,
    calculateTotalValue,
    calculateUnrealizedPL,
    calculateROI,
  };

  return (
    <TradingContext.Provider value={value}>{children}</TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error("useTrading must be used within a TradingProvider");
  }
  return context;
};

export default TradingContext;
