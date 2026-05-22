import prisma from "../lib/prisma";

/**
 * Inicia un scheduler que cada `intervalMs` ms busca permisos activos cuyo endDate ya pasó,
 * los marca como inactivos y reactiva al usuario si no tiene otros permisos activos.
 */
export function startEmployeeLeaveReactivationScheduler(intervalMs = 60 * 60 * 1000) {
  setInterval(async () => {
    try {
      // activar el permiso
      const now = new Date();

      const leavesToActivate = await prisma.employeeLeave.findMany({
        where: {
          isActive: false,
          startDate: { lte: now },
          endDate: { gt: now },
        },
        select: { id: true, userId: true },
      });

      for (const leave of leavesToActivate) {
        await prisma.$transaction(async (tx) => {
          await tx.employeeLeave.update({
            where: { id: leave.id },
            data: { isActive: true },
          });

          await tx.user.update({
            where: { id: leave.userId },
            data: { isActive: false },
          });
        });
      }

      // desactivar el permiso
      const expiredLeaves = await prisma.employeeLeave.findMany({
        where: {
          isActive: true,
          endDate: { lte: now },
        },
        select: { id: true, userId: true },
      });

      for (const leave of expiredLeaves) {
        await prisma.$transaction(async (tx) => {
          // Cerrar permiso
          await tx.employeeLeave.update({
            where: { id: leave.id },
            data: { isActive: false },
          });

          // Reactivar usuario solo si no tiene otros permisos activos
          const otherActiveCount = await tx.employeeLeave.count({
            where: {
              userId: leave.userId,
              isActive: true,
              id: { not: leave.id },
            },
          });

          if (otherActiveCount === 0) {
            await tx.user.update({
              where: { id: leave.userId },
              data: { isActive: true },
            });
          }
        });
      }
    } catch (err) {
      console.error("Error en employeeLeave scheduler:", err);
    }
  }, intervalMs);
}