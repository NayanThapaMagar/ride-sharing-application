import express from 'express';
import connectDB from './config/database';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import rideRoutes from './routes/ride';
import { setupSwagger } from './config/swagger';
import initializeSocket from './config/socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};

// Create HTTP server
const server = http.createServer(app);
export const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());


initializeSocket(io);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

// Setup Swagger
setupSwagger(app)

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

export { server };
export default app;