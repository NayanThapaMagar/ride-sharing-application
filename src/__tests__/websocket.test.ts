import { io as Client, Socket } from 'socket.io-client';
import request from 'supertest';
import app, { server } from '../server';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';


// Mock the connectDB function to avoid actually connecting to the database
jest.mock('../config/database', () => ({
  __esModule: true, // if removed gives TypeError
  default: jest.fn().mockResolvedValue('Mock Database connection'),
}));

describe('WebSocket Tests', () => {


  let socket: Socket;
  let mongoServer: MongoMemoryServer;
  let token: string;
  let rideId: string;
  let userId: string;
  const PORT = 5000;

  beforeAll(async () => {
    jest.setTimeout(20000);

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'Test1234!',
      confirmPassword: 'Test1234!',
    });

    const loginResponse = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      password: 'Test1234!',
    });
    token = loginResponse.body.token;
    userId = loginResponse.body.userId;

    const rideRequestData = {
      userId,
      pickupLocation: { lat: 12.9716, lon: 77.5946 },
      dropoffLocation: { lat: 12.9350, lon: 77.6241 },
      rideType: 'economy',
    };

    const rideRequestResponse = await request(app)
      .post('/api/rides/request')
      .set('Authorization', `Bearer ${token}`)
      .send(rideRequestData);

    rideId = rideRequestResponse.body.rideId;

    // Setup WebSocket connection
    await new Promise<void>((resolve, reject) => {
      socket = Client(`http://localhost:${PORT}`, {
        auth: { token },
      });

      socket.on('connect', () => {
        console.log('WebSocket connected at client side');
        resolve();
      });
      socket.on('disconnect', () => {
        console.log('WebSocket disconnect at client side');
        resolve();
      });

      socket.on('connect_error', (err) => {
        reject(err); // Fail the test if connection fails
      });

    });
  });

  afterAll(async () => {
    socket.disconnect();
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
  });

  it('should join a ride room and receive status updates', async () => {

    socket.emit('ride:join', rideId);

    await new Promise<void>((resolve) => {
      // Listen for the ride status update event
      socket.on('ride:status:update', (data) => {
        console.log({ rideStatusUpdateDataReceivedAtClientSide: data });

        // Ensure the correct ride ID and status
        expect(data.rideId).toBe(rideId);
        expect(data.status).toBe('accepted');

        resolve();
      });

      setTimeout(async () => {
        await request(app)
          .patch(`/api/rides/${rideId}/status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ status: 'accepted' });
      }, 200);
    });
  }, 10000);
});
