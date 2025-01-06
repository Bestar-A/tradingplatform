const axios = require("axios");
const assetTypes = ["BTC", "ETH", "BNB", "NEO", "LTC", "SOL", "XRP", "DOT", "ADA", "PEOPLE", "NAVX", "POPCAT", "PONKE"];

async function fetchCurrentMarketPrices(accountType) {
	let response;
	let futuresCurrencyPrices = [];
	let spotCurrencyPrices = [];
	if (accountType == "futures") {
		try {
			response = await axios.get(process.env.FUTURES_PRICE_API_URL);
			const prices = response.data.data
				.filter((item) => assetTypes.includes(item.symbol.split("_")[0]) && item.symbol.split("_")[1] == "USDT")
				.map((item) => ({
					assetType: item.symbol.split("_")[0],
					price: parseFloat(item.lastPrice),
					percent: parseFloat(item.riseFallRate),
					volume24: parseFloat(item.volume24),
					amount24: parseFloat(item.amount24),
					high24price: parseFloat(item.high24Price),
					low24price: parseFloat(item.lower24Price),
				}));
			futuresCurrencyPrices = prices;
			return prices;
		} catch (error) {
			console.error("Error fetching data from Mexc API:", error);
			// return [];
			return futuresCurrencyPrices;
		}
	} else if (accountType == "spot") {
		try {
			response = await axios.get(process.env.SPOT_PRICE_API_URL);
			const prices = response.data.data
				.filter((item) => assetTypes.includes(item.symbol.split("_")[0]) && item.symbol.split("_")[1] == "USDT")
				.map((item) => ({
					assetType: item.symbol.split("_")[0],
					price: parseFloat(item.last),
					percent: parseFloat(item.change_rate),
					volume24: parseFloat(item.volume),
					amount24: parseFloat(item.amount),
					high24Price: parseFloat(item.high),
					low24price: parseFloat(item.low),
				}));

			spotCurrencyPrices = prices;
			return prices;
		} catch (error) {
			console.error("Error fetching data from Mexc API:", error);
			// return [];
			return spotCurrencyPrices;
		}
	} else {
		console.error("Error fetching data from Mexc API: bad request:", error);
	}
}

async function fetchCandles(symbol, interval) {
	try {
		const response = await axios.get("https://api.binance.com/api/v3/klines", {
			params: { symbol, interval },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching candles from Binance:", error);
		return null;
	}
}

module.exports = { fetchCurrentMarketPrices, fetchCandles };
