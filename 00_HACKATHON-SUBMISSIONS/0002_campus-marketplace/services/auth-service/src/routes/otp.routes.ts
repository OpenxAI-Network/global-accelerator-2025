import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import * as otpService from '../services/otp.service';
import * as emailService from '../services/email.service';
import * as userService from '../services/user.service';
import jwt from 'jsonwebtoken';

const router = Router();

// Rate limiter for OTP initialization and resend requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many OTP requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * POST /api/auth/otp/signup-init
 * Initiates the signup process by sending an OTP to the user's email.
 */
router.post('/signup-init', otpLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const otp = await otpService.createOtp(email, 'SIGNUP');
    await emailService.sendOtpEmail(email, otp);

    res.status(202).json({ message: 'OTP has been sent to your email address.' });
  } catch (error) {
    console.error('SIGNUP_INIT_ERROR:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

/**
 * POST /api/auth/otp/signup-verify
 * Verifies the OTP and creates the new user account.
 */
router.post('/signup-verify', async (req: Request, res: Response) => {
  try {
    const { email, otp, name, password, school } = req.body;
    if (!email || !otp || !name || !password || !school) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const verification = await otpService.verifyOtp(email, otp, 'SIGNUP');
    if (!verification.success) {
      return res.status(400).json({ error: verification.message });
    }

    const user = await userService.createUser(name, email, password, school);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(201).json({ user, token });

  } catch (error) {
    console.error('SIGNUP_VERIFY_ERROR:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

/**
 * POST /api/auth/otp/forgot-init
 * Initiates the forgot password flow. Sends OTP if user exists.
 */
router.post('/forgot-init', otpLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (email) {
      const user = await userService.findUserByEmail(email);
      // Only send an email if the user actually exists.
      if (user) {
        const otp = await otpService.createOtp(email, 'FORGOT_PASSWORD');
        await emailService.sendOtpEmail(email, otp);
      }
    }
    // Always return a generic success message to prevent account enumeration.
    res.status(202).json({ message: 'If an account with that email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('FORGOT_INIT_ERROR:', error);
    // Do not send a 500 error to the client, as that can also leak information.
    res.status(202).json({ message: 'If an account with that email exists, an OTP has been sent.' });
  }
});

/**
 * POST /api/auth/otp/forgot-verify
 * Verifies the OTP and resets the user's password.
 */
router.post('/forgot-verify', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    const verification = await otpService.verifyOtp(email, otp, 'FORGOT_PASSWORD');
    if (!verification.success) {
      return res.status(400).json({ error: verification.message });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      // This case should be rare if verifyOtp passed, but is a good safeguard.
      return res.status(404).json({ error: 'User not found.' });
    }

    await userService.updateUserPassword(user.id, newPassword);

    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('FORGOT_VERIFY_ERROR:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

/**
 * POST /api/auth/otp/resend
 * Resends an OTP for a given flow.
 */
router.post('/resend', otpLimiter, async (req: Request, res: Response) => {
  try {
    const { email, flow } = req.body;
    if (!email || !flow || !['SIGNUP', 'FORGOT_PASSWORD'].includes(flow)) {
      return res.status(400).json({ error: 'A valid email and flow (SIGNUP or FORGOT_PASSWORD) are required' });
    }

    // For signup, we must ensure the user does not already exist.
    if (flow === 'SIGNUP') {
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
    }
    // For forgot password, we must ensure the user *does* exist.
    else if (flow === 'FORGOT_PASSWORD') {
      const existingUser = await userService.findUserByEmail(email);
      if (!existingUser) {
        // Return generic message to prevent enumeration
        return res.status(202).json({ message: 'If an account with that email exists, an OTP has been sent.' });
      }
    }

    const otp = await otpService.createOtp(email, flow);
    await emailService.sendOtpEmail(email, otp);

    res.status(202).json({ message: 'A new OTP has been sent to your email address.' });

  } catch (error) {
    console.error('RESEND_OTP_ERROR:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

export default router;
