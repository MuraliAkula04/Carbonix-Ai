import { ChatService } from '../services/chat.service.js';
import prisma from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

export class ChatController {
  static async sendMessage(req, res, next) {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        throw new AppError('Message is required', 400);
      }

      const result = await ChatService.processMessage(req.user.id, message);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'asc' },
        take: 50
      });

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (err) {
      next(err);
    }
  }
}
