const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const withdrawalRoutes = require('./routes/withdrawal');
const positionRoutes = require('./routes/position');
const tradeRoutes = require('./routes/trade');
const balanceRoutes = require('./routes/balance');
const marketRoutes = require('./routes/market');
const candlesRoutes = require('./routes/candles');
const updateValueRoutes = require('./routes/updateValue');
const spotPositionRoutes = require('./routes/spotPosition');
const partialClosePositionRoutes = require('./routes/partialClosePosition');
const { startCheckingOrderService } = require('./services/checkingOrderService');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());

app.use(cors({
  origin : 'http://localhost:3000'
}));

app.use('/api/auth', authRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/position', positionRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/candles', candlesRoutes);
app.use('/api/updateValue', updateValueRoutes);
app.use('/api/openSpotPosition', spotPositionRoutes);
app.use('/api/partialClosePosition', partialClosePositionRoutes);

app.listen(5000, async () => {
  await connectDB();
  startCheckingOrderService();
  console.log('Server running on port 5000 http://localhost:5000/')
});