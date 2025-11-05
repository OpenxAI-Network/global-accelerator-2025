import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { pool } from './database';
import authRouter from './routes/auth.routes';
import otpRouter from './routes/otp.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/auth/otp', otpRouter);




app.listen(port, () => {
  console.log(`Auth service listening on port ${port}`);
});
