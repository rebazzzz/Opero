import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export class MessagingService {
  async getThread(threadId: string, organizationId: string) {
    const thread = await prisma.messageThread.findFirst({
      where: {
        id: threadId,
        organizationId
      },
      select: {
        id: true,
        organizationId: true,
        createdAt: true,
        messages: {
          select: {
            id: true,
            threadId: true,
            senderId: true,
            content: true,
            createdAt: true
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!thread) {
      throw new AppError(404, "Thread not found", "THREAD_NOT_FOUND");
    }

    return thread;
  }

  async createMessage(threadId: string, senderId: string, content: string) {
    return prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({
        where: { id: senderId },
        select: {
          id: true,
          organizationId: true
        }
      });

      if (!sender) {
        throw new AppError(401, "Sender not found", "UNAUTHORIZED");
      }

      const thread = await tx.messageThread.findFirst({
        where: {
          id: threadId,
          organizationId: sender.organizationId
        },
        select: {
          id: true,
          organizationId: true
        }
      });

      if (!thread) {
        throw new AppError(404, "Thread not found", "THREAD_NOT_FOUND");
      }

      const message = await tx.message.create({
        data: {
          threadId,
          senderId,
          content: content.trim()
        },
        select: {
          id: true,
          threadId: true,
          senderId: true,
          content: true,
          createdAt: true
        }
      });

      return {
        organizationId: thread.organizationId,
        message
      };
    });
  }

  async createThread(participants: string[], organizationId: string) {
    const uniqueParticipants = [...new Set(participants)];

    const participantCount = await prisma.user.count({
      where: {
        id: { in: uniqueParticipants },
        organizationId
      }
    });

    if (participantCount !== uniqueParticipants.length) {
      throw new AppError(
        400,
        "All participants must belong to the same organization",
        "INVALID_THREAD_PARTICIPANTS"
      );
    }

    return prisma.messageThread.create({
      data: {
        organizationId
      },
      select: {
        id: true,
        organizationId: true,
        createdAt: true
      }
    });
  }
}
