import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { logger } from "../config/logger.js";

export const organizationRoom = (organizationId: string): string => `org:${organizationId}`;

let io: Server | null = null;

export const initializeMessagingSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  io.use((socket, next) => {
    try {
      const headerToken = socket.handshake.headers.authorization?.toString();
      const authToken = socket.handshake.auth.token?.toString();
      const bearer = headerToken?.startsWith("Bearer ")
        ? headerToken.replace("Bearer ", "").trim()
        : authToken;

      if (!bearer) {
        next(new Error("Unauthorized"));
        return;
      }

      const claims = verifyAccessToken(bearer);
      socket.data.auth = {
        userId: claims.sub,
        organizationId: claims.organizationId,
        role: claims.role
      };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const organizationId = socket.data.auth.organizationId as string;
    socket.join(organizationRoom(organizationId));
    logger.info({ socketId: socket.id, organizationId }, "Messaging socket connected");
  });

  return io;
};

export const emitMessageNew = (organizationId: string, payload: unknown): void => {
  if (!io) {
    return;
  }

  io.to(organizationRoom(organizationId)).emit("message:new", payload);
};

export const closeMessagingSocket = async (): Promise<void> => {
  if (!io) {
    return;
  }

  await io.close();
  io = null;
};
