import { useState, useCallback } from 'react';
import tradingService from '../services/tradingService';
import { useTrading as useTradingContext } from '../contexts/TradingContext';

export const useTrading = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const {
    updatePositions,
    balances,
    futuresCurrentPrices,
    spotCurrentPrices
  } = useTradingContext();

  const validateFuturesTrading = useCallback((amount, leverage, limitPrice = null) => {
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    if (isNaN(leverage) || leverage < 1 || leverage > 300) {
      throw new Error('Please enter a valid leverage (1-300)');
    }
    if (limitPrice !== null && isNaN(limitPrice)) {
      throw new Error('Please enter a valid limit price');
    }
    if (amount > balances.futuresUSDTBalance) {
      throw new Error('Insufficient balance');
    }
  }, [balances.futuresUSDTBalance]);

  const validateSpotTrading = useCallback((amount, assetType, positionType, currentPrice) => {
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Please enter a valid amount');
    }

    if (positionType === 'buy') {
      const totalCost = amount * currentPrice;
      if (totalCost > balances.spotUSDTBalance) {
        throw new Error('Insufficient USDT balance');
      }
    } else {
      const assetBalance = balances.spotBalances[assetType] || 0;
      if (amount > assetBalance) {
        throw new Error(`Insufficient ${assetType} balance`);
      }
    }
  }, [balances]);

  const placeFuturesOrder = async (orderData) => {
    setIsProcessing(true);
    setError(null);
    try {
      validateFuturesTrading(orderData.amount, orderData.leverage, orderData.limitPrice);
      await tradingService.openFuturesPosition(orderData);
      await updatePositions();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const placeSpotOrder = async (orderData) => {
    setIsProcessing(true);
    setError(null);
    try {
      const currentPrice = spotCurrentPrices.find(p => p.assetType === orderData.assetType)?.price;
      validateSpotTrading(orderData.amount, orderData.spotAssetType, orderData.positionType, currentPrice);
      await tradingService.openSpotPosition(orderData);
      await updatePositions();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const closePosition = async (positionId, type, reason = 0) => {
    setIsProcessing(true);
    setError(null);
    try {
      if (type === 'futures') {
        await tradingService.closeFuturesPosition(positionId, reason);
      } else {
        await tradingService.closeSpotPosition(positionId);
      }
      await updatePositions();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    placeFuturesOrder,
    placeSpotOrder,
    closePosition,
    validateFuturesTrading,
    validateSpotTrading,
    futuresCurrentPrices
  };
};

export default useTrading;