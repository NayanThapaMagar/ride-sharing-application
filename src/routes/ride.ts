import express from 'express';
import { authenticateUser } from '../middlewares/auth';
import validateRequest from '../middlewares/validateRequest';
import { rideRequestSchema, rideDetailsSchema, rideStatusUpdateSchema } from '../validators/ride';
import { createRideRequest, getRideDetails, updateRideStatus } from '../controllers/ride';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ride
 *   description: Ride Management
 */

/**
 * @swagger
 * /rides/request:
 *   post:
 *     summary: Create a ride request
 *     tags: [Ride]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - pickupLocation
 *               - dropoffLocation
 *               - rideType
 *             properties:
 *               userId:
 *                 type: string
 *               pickupLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *               dropoffLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *               rideType:
 *                 type: string
 *                 enum: [economy, premium]
 *     responses:
 *       201:
 *         description: Ride request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rideId:
 *                   type: string
 *                 status:
 *                   type: string
 *                 requestedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request(Validation error)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/request', authenticateUser, validateRequest(rideRequestSchema), createRideRequest);


/**
 * @swagger
 * /rides/{rideId}:
 *   get:
 *     summary: Get ride details
 *     tags: [Ride]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the ride
 *     responses:
 *       200:
 *         description: Ride details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rideId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 pickupLocation:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *                 dropoffLocation:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *                 status:
 *                   type: string
 *                 rideType:
 *                   type: string
 *       400:
 *         description: Bad request(Validation error)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User/Ride not found
 *       500:
 *         description: Internal server error
 */
router.get('/:rideId', authenticateUser, validateRequest(rideDetailsSchema), getRideDetails);

/**
 * @swagger
 * /rides/{rideId}/status:
 *   patch:
 *     summary: Update ride status
 *     tags: [Ride]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the ride
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, in-progress, completed, canceled]
 *     responses:
 *       200:
 *         description: Ride status updated successfully
 *       400:
 *         description: Bad request(Validation error)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User/Ride not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:rideId/status', authenticateUser, validateRequest(rideStatusUpdateSchema), updateRideStatus);

export default router; 
