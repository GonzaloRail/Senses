import { addMinutes } from "date-fns";

import { AppError, encryptPassword, verifyPassword } from "../../common/utils";
import { generateSecureToken } from "../../common/utils/tokensAccountUtils";
import prisma from "../../lib/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/jwt";
import { LoginUserInput } from "../validators/auth.validator";
import { passwordResetEmailTemplate } from "../../features/email/templates";
import { sendEmail } from "../../features/email/service";
import { env } from "../../common/config";

export const loginUserService = async (data: LoginUserInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    include: {
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError("El usuario no existe", 404);
  }

  const isPasswordValid = await verifyPassword(data.password, user.password!);

  if (!isPasswordValid) {
    throw new AppError("Contraseña incorrecta", 401);
  }

  const token = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
    refreshToken,
  };
};

export const refreshTokenService = async (refreshToken: string = "") => {
  try {
    const decoded = verifyToken(refreshToken, "refresh");
    if (!refreshToken || !decoded) {
      throw new AppError("Invalid refresh token", 401);
    }
    const newToken = generateAccessToken(decoded.userId, decoded.roleId ?? "");

    const roleName = await getRoleNameById(decoded.roleId ?? "");
    const user = await getUserDbById(decoded.userId);

    return { newToken, roleSelected: roleName, user };
  } catch (error) {
    throw new AppError("No token provided", 401);
  }
};

export const selectRoleAndLocationService = async (
  refreshToken: string,
  roleId: string
) => {
  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  const decoded = verifyToken(refreshToken, "refresh");
  // TODO
  // Validaciones opcionales: asegúrate de que el rol y la sede pertenezcan al usuario.
  // Esto puede hacerse con una consulta a la base de datos si se requiere.

  const newAccessToken = generateAccessToken(decoded.userId, roleId);
  const newRefreshToken = generateRefreshToken(decoded.userId, roleId);
  const roleName = await getRoleNameById(roleId);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    roleSelected: roleName,
  };
};

const getRoleNameById = async (roleId: string) => {
  const roleName = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      name: true,
    },
  });
  return roleName?.name;
};

const getUserDbById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return user ? user : null;
};

export const activateAccountService = async (
  token: string,
  password: string
) => {
  const authToken = await prisma.authToken.findUnique({
    where: { token },
    include: { user: true },
  });

  // Validaciones
  if (!authToken) {
    throw new AppError("Token de activación inválido", 400);
  }

  if (authToken.isUsed) {
    throw new AppError("Este link de activación ya ha sido utilizado", 400);
  }

  if (authToken.type !== "ACCOUNT_ACTIVATION") {
    throw new AppError("Tipo de token inválido", 400);
  }

  // Encriptar la nueva contraseña

  const hashedPassword = await encryptPassword(password);

  // Actualizar usuario y marcar token como usado
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: authToken.userId },
      data: {
        password: hashedPassword,
        isActive: true,
        isEmailVerified: true,
      },
      include: {
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.authToken.update({
      where: { id: authToken.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    }),
  ]);

  const { password: _, ...userWithoutPassword } = updatedUser;

  return {
    user: userWithoutPassword,
  };
};

export const validateActivationTokenService = async (token: string) => {
  const authToken = await prisma.authToken.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!authToken) {
    return { isValid: false, error: "Token inválido" };
  }

  if (authToken.isUsed) {
    return { isValid: false, error: "Este link ya ha sido utilizado" };
  }

  if (authToken.type !== "ACCOUNT_ACTIVATION") {
    return { isValid: false, error: "Tipo de token inválido" };
  }

  return {
    isValid: true,
    user: authToken.user,
  };
};

/**
 * Solicitar reset de contraseña
 */
export const requestPasswordResetService = async (
  email: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Por seguridad, no revelamos si el usuario existe
    return {
      success: true,
      message: "Si el correo existe, recibirás un enlace de recuperación",
    };
  }

  // Invalidar tokens de reset anteriores no usados
  await prisma.passwordReset.updateMany({
    where: {
      userId: user.id,
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });

  // Generar nuevo token con expiración de 30 minutos
  const resetToken = generateSecureToken();
  const expiresAt = addMinutes(new Date(), 30);

  await prisma.passwordReset.create({
    data: {
      token: resetToken,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  // Generar link
  const resetLink = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  // Enviar email
  const resetEmailHtml = passwordResetEmailTemplate(
    `${user.firstName} ${user.lastName}`,
    user.email,
    resetLink
  );

  await sendEmail({
    subject: "Recuperación de contraseña - Senses Psicólogo S.A.C.",
    to: user.email,
    html: resetEmailHtml,
  });

  return {
    success: true,
    message: "Si el correo existe, recibirás un enlace de recuperación",
    // Solo para desarrollo/testing
    ...(process.env.NODE_ENV === "development" && { resetToken, resetLink }),
  };
};

export const resetPasswordService = async (
  token: string,
  newPassword: string
) => {
  const resetToken = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  // Validaciones
  if (!resetToken) {
    throw new AppError("Token inválido", 400);
  }

  if (resetToken.isUsed) {
    throw new AppError("Este token ya ha sido utilizado", 400);
  }

  if (resetToken.expiresAt < new Date()) {
    throw new AppError("El token ha expirado", 400);
  }

  // Encriptar nueva contraseña
  const hashedPassword = await encryptPassword(newPassword);

  // Actualizar contraseña y marcar token como usado
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    }),
  ]);

  return {
    success: true,
    message: "Contraseña actualizada exitosamente",
  };
};

export const validateResetTokenService = async (token: string) => {
  const resetToken = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return { isValid: false, error: "Token inválido" };
  }

  if (resetToken.isUsed) {
    return { isValid: false, error: "Este token ya ha sido utilizado" };
  }

  if (resetToken.expiresAt < new Date()) {
    return { isValid: false, error: "El token ha expirado" };
  }

  return {
    isValid: true,
    expiresAt: resetToken.expiresAt,
  };
};
