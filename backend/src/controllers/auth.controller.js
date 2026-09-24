import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { ENV } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, location } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        throw new AppError('An account with this email already exists', 409);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          location: location || null,
          role: 'USER'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          location: true,
          createdAt: true
        }
      });

      const token = jwt.sign({ userId: user.id, role: user.role }, ENV.JWT_SECRET, {
        expiresIn: '7d'
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, ENV.JWT_SECRET, {
        expiresIn: '7d'
      });

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        createdAt: user.createdAt
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
