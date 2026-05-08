import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ApiResponse, JwtPayload } from '../types';

const signToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_change_this';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' } as ApiResponse);
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' } as ApiResponse);
      return;
    }

    // Cek email sudah ada
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered. Please login.' } as ApiResponse);
      return;
    }

    // Buat user baru
    const user = await User.create({ name, email, password });

    const token = signToken({ userId: user._id.toString(), email: user.email });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: (error as Error).message } as ApiResponse);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' } as ApiResponse);
      return;
    }

    // Cari user (include password untuk verifikasi)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' } as ApiResponse);
      return;
    }

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' } as ApiResponse);
      return;
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: (error as Error).message } as ApiResponse);
  }
};

/**
 * GET /api/auth/me  (protected)
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as ApiResponse);
      return;
    }
    res.status(200).json({
      success: true,
      message: 'User retrieved',
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user' } as ApiResponse);
  }
};