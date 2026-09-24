import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AppError } from './error.middleware.js';
import prisma from '../config/db.js';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new AppError('Authorization header missing', 401);
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (err) {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, location: true }
    });

    if (!user) {
      throw new AppError('User not found or deleted', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
