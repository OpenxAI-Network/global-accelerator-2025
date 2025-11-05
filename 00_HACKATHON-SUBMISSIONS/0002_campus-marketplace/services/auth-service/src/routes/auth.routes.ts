import { Router, Request, Response } from 'express';
import * as userService from '../services/user.service';
import * as emailService from '../services/email.service';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();

const isAuthenticated = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { name, email, password, school } = req.body;
        if (!name || !email || !password || !school) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await userService.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await userService.createUser(name, email, password, school);
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('SIGNUP_ERROR:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await userService.loginUser(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ user, token });
    } catch (error) {
        console.error('LOGIN_ERROR:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

router.get('/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const user = await userService.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('ME_ERROR:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await userService.findUserByEmail(email);

        if (user) {
            const resetToken = await userService.createPasswordResetToken(email);
            await emailService.sendPasswordResetEmail(email, resetToken);
        }

        return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error('FORGOT_PASSWORD_ERROR:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await userService.findUserByResetToken(hashedToken);

        if (!user) {
            return res.status(400).json({ error: 'This password reset token is invalid or has expired.' });
        }

        await userService.updateUserPassword(user.id, password);

        return res.status(200).json({ message: 'Your password has been reset successfully.' });

    } catch (error) {
        console.error('RESET_PASSWORD_ERROR:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

router.put('/profile/:userId', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        // Basic validation
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        // Sanitize updates to only allow certain fields
        const allowedUpdates = ['name', 'school', 'bio', 'phone', 'avatar'];
        const sanitizedUpdates: { [key: string]: any } = {};
        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                sanitizedUpdates[key] = updates[key];
            }
        }

        if (Object.keys(sanitizedUpdates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update.' });
        }

        const updatedUser = await userService.updateUserProfile(parseInt(userId, 10), sanitizedUpdates);

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.status(200).json(updatedUser);

    } catch (error) {
        console.error('UPDATE_PROFILE_ERROR:', error);
        return res.status(500).json({ error: error.message ?? 'An internal server error occurred.' });
    }
});

export default router;
