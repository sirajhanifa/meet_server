const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./db/connect.js.js');
const transcriptRoutes = require('./routes/transcriptRoutes.js');
const socketHandler = require('./signaling/socketHandler.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use('/api', transcriptRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
socketHandler(io);

server.listen(5000, () => console.log('🚀 Server running on port 5000'));
