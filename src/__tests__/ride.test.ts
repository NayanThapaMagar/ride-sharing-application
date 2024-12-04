import request from 'supertest';
import app, { server } from '../server';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';


// Mock the connectDB function to avoid actually connecting to the database
jest.mock('../config/database', () => ({
  __esModule: true, // if removed gives TypeError
  default: jest.fn().mockResolvedValue('Mock Database connection'),
}));

describe('Ride APIs', () => {

  let mongoServer: MongoMemoryServer;
  let token: string;
  let rideId: string;
  let userId: string;

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
  });

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

  it('should update ride status', async () => {
    const response = await request(app)
      .patch(`/api/rides/${rideId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'accepted' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Ride status updated successfully.');
  });

  it('should return error for invalid ride status update', async () => {
    const response = await request(app)
      .patch(`/api/rides/${rideId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid-status' });

    expect(response.status).toBe(400);
    expect(response.body.message[0]).toBe('Invalid ride status');
  });

  it('should get ride details', async () => {
    const response = await request(app)
      .get(`/api/rides/${rideId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.rideId).toBeDefined();
    expect(response.body.userId).toBe(userId);
    expect(response.body.rideType).toBeDefined();
  });

  it('should return error for fake rideId', async () => {
    const fakeRideId = '609b4c9f6d4d1b2e1b4f8db1'
    const response = await request(app)
      .get(`/api/rides/${fakeRideId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Ride not found');
  });
});
