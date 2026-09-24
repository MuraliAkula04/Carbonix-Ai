import { z } from 'zod';
import { AppError } from './error.middleware.js';

export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new AppError(`Validation error: ${errorMessages}`, 400));
      } else {
        next(err);
      }
    }
  };
}

// Common Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    location: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const activitySchema = z.object({
  body: z.object({
    category: z.enum(['electricity', 'transport', 'food']),
    activityType: z.string().min(1, 'Activity type is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    date: z.string().datetime().optional()
  })
});

export const batchActivitySchema = z.object({
  body: z.object({
    electricity: z.number().nonnegative().optional(),
    travel: z.number().nonnegative().optional(),
    food: z.string().optional()
  })
});

export const goalSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Goal title is required'),
    targetEmission: z.number().positive('Target emission must be greater than 0'),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
});
