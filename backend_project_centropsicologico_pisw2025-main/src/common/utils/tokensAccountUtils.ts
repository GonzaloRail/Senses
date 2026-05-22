import crypto from "crypto";
import prisma from "../../lib/prisma";

/**
 * Generar token seguro
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Limpiar tokens expirados (ejecutar con cron job)
 */
export const cleanupExpiredTokensService = async () => {
  const now = new Date();

  // Solo eliminar tokens de reset expirados
  // Los de activación no tienen expiración
  const deletedResets = await prisma.passwordReset.deleteMany({
    where: {
      expiresAt: { lt: now },
      isUsed: false,
    },
  });

  return {
    deletedPasswordResets: deletedResets.count,
  };
};
