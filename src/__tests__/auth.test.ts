import request from 'supertest';
import app, { server } from '../server';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';


// Mock the connectDB function to avoid actually connecting to the database
jest.mock('../config/database', () => ({
    __esModule: true, // if removed gives TypeError
    default: jest.fn().mockResolvedValue('Mock Database connection'),
}));

describe('Auth APIs', () => {

    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
        server.close();
    });

    let userCredentials = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
    };

    it('should register a new user', async () => {
        const response = await request(app).post('/api/auth/register').send(userCredentials);

        expect(response.status).toBe(201);
        expect(response.body.token).toBeDefined();
    });

    it('should login a user and return JWT token', async () => {
        await request(app).post('/api/auth/register').send(userCredentials);
        const response = await request(app).post('/api/auth/login').send({
            username: userCredentials.username,
            password: userCredentials.password,
        });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    it('should return an error for invalid user', async () => {
        const response = await request(app).post('/api/auth/login').send({
            username: 'wronguser',
            password: 'wrongpass',
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User not found');
    });

    it('should return an error for invalid password', async () => {
        await request(app).post('/api/auth/register').send(userCredentials);
        const response = await request(app).post('/api/auth/login').send({
            username: userCredentials.username,
            password: 'wrongpass',
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Incorrect password');
    });
});
