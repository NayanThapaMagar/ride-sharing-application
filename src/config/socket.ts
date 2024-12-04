import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


interface AuthenticatedSocket extends Socket {
    userId?: string;
}

const initializeSocket = (io: Server) => {

    io.use((socket: AuthenticatedSocket, next: (err?: Error) => void) => {
        const token = socket.handshake.auth.token;

        // only for weboscket demonstration
        // const token = socket.handshake.headers['authorization']?.split(' ')[1];

        if (!token) {
            return next(new Error("Authentication error: Token is required"));
        }

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
            socket.userId = payload.userId;
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.userId}`);

        socket.on("ride:join", (rideId: string) => {
            console.log(`User ${socket.userId} joined ride: ${rideId}`);
            socket.join(rideId);
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

export default initializeSocket;
