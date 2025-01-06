const { getUser, saveUser } = require("../services/userService");
const { fetchCurrentMarketPrices } = require("../utils/market");
const { sendPositionPartialClosedEmail } = require("../utils/email");

async function partialClosePosition(username, positionId, percent) {
  try {
    const user = await getUser(username);
    const reason = 4; // partial closing.
    if (!user) {
      throw new Error("User not found");
    }

    // Find the position to close
    const positionIndex = user.futuresPositions.findIndex(
      (pos) => pos.id === positionId
    );
    if (positionIndex === -1) throw new Error("Position not found");

    // const closedPosition = user.futuresPositions.splice(positionIndex, 1)[0];
    const closedPosition = { ...user.futuresPositions[positionIndex] };

    // Fetch the current market price
    const currentMarketPrices = await fetchCurrentMarketPrices("futures");
    if (currentMarketPrices === null) {
      throw new Error("Error fetching market price");
    }

    const currentMarketPrice = currentMarketPrices.filter(
      (item) => item.assetType == closedPosition.assetType
    )[0].price;

    // Calculate realized profit or loss
    const priceDiff =
      (currentMarketPrice - closedPosition.entryPrice) *
      (closedPosition.positionType === "Long" ? 1 : -1);
    let profitLoss =
      ((closedPosition.amount * percent) / 100) *
      closedPosition.leverage *
      (priceDiff / closedPosition.entryPrice);

    if (closedPosition.orderLimit) profitLoss = 0;

    // Update balance
    user.futuresUSDTBalance +=
      (closedPosition.amount * percent) / 100 + profitLoss; // Add the amount and profit/loss
    closedPosition.amount *= percent / 100;

    // Log the closed position with realized P/L
    if (!user.closedFuturesPositions) {
      user.closedFuturesPositions = [];
    }
    user.closedFuturesPositions.push({
      ...closedPosition,
      exitPrice: currentMarketPrice,
      realizedPL: profitLoss,
      closedReason: reason,
    });

    user.futuresPositions = user.futuresPositions.map(
      (position, index) =>
        index === positionIndex
          ? {
              ...position,
              amount: position.amount - closedPosition.amount,
              closedAmount:
                (position?.closedAmount || 0) + closedPosition.amount,
            } // Update the amount
          : position // Keep the existing position
    );
    sendPositionPartialClosedEmail(
      username,
      closedPosition,
      currentMarketPrice
    );
    await saveUser(user);
    return {
      futuresPositions: user.futuresPositions,
      newfuturesUSDTBalance: user.futuresUSDTBalance,
      profitLoss,
      ok: true,
    };
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

module.exports = { partialClosePosition };
