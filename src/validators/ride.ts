import { z } from 'zod';

export const rideRequestSchema = z.object({
    body: z.object({
        userId: z.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid User")
            .min(1, "User ID is required"),
        pickupLocation: z.object({
            lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
            lon: z.number().min(-180).max(180, "Longitude must be between -180 and 180")
        }),
        dropoffLocation: z.object({
            lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
            lon: z.number().min(-180).max(180, "Longitude must be between -180 and 180")
        }),
        rideType: z.enum(['economy', 'premium'], { message: "Invalid ride type" })
    }),
});

export const rideDetailsSchema = z.object({
    params: z.object({
        rideId: z.string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid Ride")
            .min(1, "Ride ID is required"),
    }),
});

export const rideStatusUpdateSchema = z.object({
    body: z.object({
        status: z.enum(['pending', 'accepted', 'in-progress', 'completed', 'canceled'], {
            message: "Invalid ride status"
        })
    }),
});