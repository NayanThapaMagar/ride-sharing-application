import request from 'supertest';
import app, { server } from '../server';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { io as Client, Socket } from 'socket.io-client';


// Mock the connectDB function to avoid actually connecting to the database
jest.mock('../config/database', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('Mock Database connection'),
}));

describe('Integration Tests', () => {

  let mongoServer: MongoMemoryServer;
  let token: string;
  let rideId: string;
  let userId: string;
  let socket: Socket;
  const PORT = 5000;

  beforeAll(async () => {
    jest.setTimeout(20000);
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    socket.disconnect();
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
  });

  // Authentication Tests
  describe('Authentication', () => {
    it('should register a new user and return JWT token', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();

    });

    it('should login a user and return JWT token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'newuser',
          password: 'Test1234!',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
      token = loginResponse.body.token;
      userId = loginResponse.body.userId;
    });

    it('should return an error for invalid login credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wronguser',
          password: 'wrongpass',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User not found');
    });
  });

  // Ride Tests
  describe('Ride Requests', () => {
    it('should create a ride request', async () => {
      const rideRequestData = {
        userId,
        pickupLocation: { lat: 12.9716, lon: 77.5946 },
        dropoffLocation: { lat: 12.9350, lon: 77.6241 },
        rideType: 'economy',
      };

      const response = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${token}`)
        .send(rideRequestData);

      expect(response.status).toBe(201);
      expect(response.body.rideId).toBeDefined();
      rideId = response.body.rideId;
    });

    it('should update the ride status', async () => {
      const response = await request(app)
        .patch(`/api/rides/${rideId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'accepted' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Ride status updated successfully.');
    });

    it('should return an error for invalid ride status update', async () => {
      const response = await request(app)
        .patch(`/api/rides/${rideId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
      expect(response.body.message[0]).toBe('Invalid ride status');
    });

    it('should get the details of a ride', async () => {
      const response = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.rideId).toBeDefined();
      expect(response.body.userId).toBe(userId);
      expect(response.body.rideType).toBe('economy');
    });

    it('should return error for non-existent ride ID', async () => {
      const fakeRideId = '609b4c9f6d4d1b2e1b4f8db1';
      const response = await request(app)
        .get(`/api/rides/${fakeRideId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Ride not found');
    });
  });

  // WebSocket Tests
  describe('WebSocket', () => {
    beforeAll((done) => {
      socket = Client(`http://localhost:${PORT}`, {
        auth: { token },
      });

      socket.on('connect', () => {
        done();
      });
      socket.on('disconnect', () => {
        done();
      });

      socket.on('connect_error', (err) => {
        done(err);
      });
    });

    it('should join a ride room and receive status updates', async () => {
      jest.setTimeout(10000);

      socket.emit('ride:join', rideId);

      await new Promise<void>((resolve) => {
        socket.on('ride:status:update', (data) => {
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
    });

  });
});
