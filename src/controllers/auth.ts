import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';


export const registerUser: RequestHandler = async (req: Request, res: Response) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        res.status(400).json({ message: 'Passwords does not match' });
        return;
    }

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const conflictField = existingUser.email === email ? 'email' : 'username';
            res.status(401).json({
                message: `User with this ${conflictField} already exists. Please try with a different ${conflictField}.`
            });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });
        const token = jwt.sign({ userId: newUser._id, username }, process.env.JWT_SECRET || '', {
            expiresIn: '1h',
        });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login User
export const loginUser: RequestHandler = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Incorrect password' });
            return;
        }
        const token = jwt.sign({ userId: user._id, username }, process.env.JWT_SECRET || '', {
            expiresIn: '1h',
        });
        res.status(200).json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
