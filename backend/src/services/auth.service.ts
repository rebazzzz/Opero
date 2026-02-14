import { FeatureModuleName, Plan, UserRole } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import type { JwtClaims } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";
import { addDurationToDate } from "../utils/date.js";
import { comparePassword, hashPassword, hashToken } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import type {
  LoginInput,
  LogoutInput,
  RefreshInput,
  RegisterInput
} from "../validators/auth.validator.js";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const defaultFeatureModulesByPlan: Record<Plan, FeatureModuleName[]> = {
  FREE: [FeatureModuleName.PROJECTS, FeatureModuleName.CRM],
  PRO: [FeatureModuleName.PROJECTS, FeatureModuleName.CRM, FeatureModuleName.INVOICES],
  BUSINESS: [
    FeatureModuleName.PROJECTS,
    FeatureModuleName.CRM,
    FeatureModuleName.INVOICES,
    FeatureModuleName.MESSAGING,
    FeatureModuleName.NOTIFICATIONS
  ],
  ENTERPRISE: [
    FeatureModuleName.PROJECTS,
    FeatureModuleName.CRM,
    FeatureModuleName.INVOICES,
    FeatureModuleName.MESSAGING,
    FeatureModuleName.ANALYTICS,
    FeatureModuleName.NOTIFICATIONS
  ]
};

const issueSessionTokens = async (claims: Omit<JwtClaims, "type">): Promise<AuthTokens> => {
  const accessToken = signAccessToken(claims);
  const refreshToken = signRefreshToken(claims);

  await prisma.session.upsert({
    where: {
      id: claims.sessionId
    },
    update: {
      refreshToken: hashToken(refreshToken),
      expiresAt: addDurationToDate(env.JWT_REFRESH_EXPIRES_IN)
    },
    create: {
      id: claims.sessionId,
      userId: claims.sub,
      refreshToken: hashToken(refreshToken),
      expiresAt: addDurationToDate(env.JWT_REFRESH_EXPIRES_IN)
    }
  });

  return { accessToken, refreshToken };
};

export class AuthService {
  async register(input: RegisterInput) {
    if (input.role === UserRole.CLIENT) {
      throw new AppError(400, "Direct CLIENT registration is not allowed", "INVALID_REGISTRATION_ROLE");
    }

    const passwordHash = await hashPassword(input.password);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: input.organizationName,
          plan: input.plan
        }
      });

      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: input.role,
          organizationId: organization.id
        },
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true
        }
      });

      const enabledModules = new Set(defaultFeatureModulesByPlan[input.plan]);

      await tx.featureModule.createMany({
        data: Object.values(FeatureModuleName).map((moduleName) => ({
          name: moduleName,
          organizationId: organization.id,
          enabled: enabledModules.has(moduleName)
        }))
      });

      return { organization, user };
    });

    const tokens = await issueSessionTokens({
      sub: result.user.id,
      organizationId: result.user.organizationId,
      role: result.user.role,
      sessionId: randomUUID()
    });

    return {
      organization: result.organization,
      user: result.user,
      tokens
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId: input.organizationId,
          email: input.email
        }
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        organizationId: true
      }
    });

    if (!user) {
      throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    const tokens = await issueSessionTokens({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
      sessionId: randomUUID()
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      },
      tokens
    };
  }

  async refresh(input: RefreshInput) {
    const claims = verifyRefreshToken(input.refreshToken);

    const session = await prisma.session.findUnique({
      where: { id: claims.sessionId },
      select: { id: true, userId: true, refreshToken: true, expiresAt: true }
    });

    if (!session || session.userId !== claims.sub) {
      throw new AppError(401, "Session is invalid", "INVALID_SESSION");
    }

    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new AppError(401, "Session has expired", "SESSION_EXPIRED");
    }

    if (session.refreshToken !== hashToken(input.refreshToken)) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new AppError(401, "Refresh token mismatch", "INVALID_REFRESH_TOKEN");
    }

    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, role: true, organizationId: true }
    });

    if (!user) {
      throw new AppError(401, "User not found", "INVALID_SESSION");
    }

    const tokens = await issueSessionTokens({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
      sessionId: claims.sessionId
    });

    return { tokens };
  }

  async logout(input: LogoutInput) {
    const claims = verifyRefreshToken(input.refreshToken);
    const tokenHash = hashToken(input.refreshToken);

    await prisma.session.deleteMany({
      where: {
        id: claims.sessionId,
        userId: claims.sub,
        refreshToken: tokenHash
      }
    });

    return { success: true };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            name: true,
            plan: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError(404, "User not found", "USER_NOT_FOUND");
    }

    return user;
  }
}
