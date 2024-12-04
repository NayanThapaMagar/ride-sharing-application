import mongoose, { Schema, Document } from 'mongoose';

interface Ride extends Document {
    userId: string;
    pickupLocation: { lat: number; lon: number };
    dropoffLocation: { lat: number; lon: number };
    rideType: 'economy' | 'premium';
    status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'canceled';
    requestedAt: Date;
}

const rideSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        pickupLocation: {
            lat: { type: Number, required: true },
            lon: { type: Number, required: true }
        },
        dropoffLocation: {
            lat: { type: Number, required: true },
            lon: { type: Number, required: true }
        },
        rideType: {
            type: String,
            enum: ['economy', 'premium'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'in-progress', 'completed', 'canceled'],
            default: 'pending'
        },
        requestedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const RideModel = mongoose.model<Ride>('Ride', rideSchema);

export default RideModel;




