import type { UserRole } from "@prisma/client";

export type TokenKind = "access" | "refresh";

export interface JwtClaims {
  sub: string;
  organizationId: string;
  role: UserRole;
  sessionId: string;
  type: TokenKind;
}

export interface AuthContext {
  userId: string;
  organizationId: string;
  role: UserRole;
  sessionId: string;
}
