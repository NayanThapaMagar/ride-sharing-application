import { Request, Response } from 'express';
import RideModel from '../models/Ride';
import { io } from '../server';

// Controller for creating a ride request
export const createRideRequest = async (req: Request, res: Response) => {
    try {

        const { userId, pickupLocation, dropoffLocation, rideType } = req.body;

        const newRide = new RideModel({
            userId,
            pickupLocation,
            dropoffLocation,
            rideType,
            status: 'pending',
            requestedAt: new Date()
        });

        await newRide.save();

        res.status(201).json({
            message: 'Ride request successfully created.',
            rideId: newRide._id,
            status: newRide.status,
            requestedAt: newRide.requestedAt.toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller for getting ride details by rideId
export const getRideDetails = async (req: Request, res: Response) => {
    const { rideId } = req.params;

    try {
        const ride = await RideModel.findById(rideId);

        if (!ride) {
            res.status(404).json({ message: 'Ride not found' });
            return;
        }

        res.status(200).json({
            rideId: ride._id,
            status: ride.status,
            userId: ride.userId,
            pickupLocation: ride.pickupLocation,
            dropoffLocation: ride.dropoffLocation,
            rideType: ride.rideType,
            requestedAt: ride.requestedAt.toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller for updating ride status
export const updateRideStatus = async (req: Request, res: Response) => {
    const { rideId } = req.params;

    try {
        const { status } = req.body;

        const updatedRide = await RideModel.findByIdAndUpdate(
            rideId,
            { status },
            { new: true }
        );

        if (!updatedRide) {
            res.status(404).json({ message: "Ride not found" });
            return;
        }

        io.to(rideId).emit("ride:status:update", {
            rideId: updatedRide._id,
            status: updatedRide.status,
            message: `Ride status updated to ${updatedRide.status}`,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ message: "Ride status updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};