import { AppointmentStatus } from "@prisma/client";
import { EmployeeLeaveForTable } from "../../apiResponses/EmployeeLeaveForTable";
import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import {
  CreateEmployeeLeaveInput,
  GetAllEmployeeLeavesInput,
  GetEmployeeLeaveByIdInput,
  GetEmployeeLeavesByUserIdInput,
  UpdateEmployeeLeaveInput,
  UpdateEmployeeLeaveStatusInput,
} from "./schema";
import { getUrlFileByFilePath } from "../../common/utils/getUrlFileByFilePath";

export const getAllEmployeeLeavesService = async ({
  page,
  take,
}: GetAllEmployeeLeavesInput) => {
  const employeeLeavesDb = await prisma.employeeLeave.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      startDate: true,
      endDate: true,
      isActive: true,
    },
  });

  const totalPages = Math.ceil((await prisma.employeeLeave.count()) / take!);

  const employeeLeaves: EmployeeLeaveForTable[] = employeeLeavesDb.map(
    (employeeLeave) => ({
      id: employeeLeave.id,
      psychologistName: `${employeeLeave.user.firstName} ${employeeLeave.user.lastName}`,
      startDate: employeeLeave.startDate,
      endDate: employeeLeave.endDate,
      isActive: employeeLeave.isActive,
    })
  );
  return {
    currentPage: page!,
    totalPages,
    employeeLeaves: employeeLeaves,
  };
};

export const getEmployeeLeaveByIdService = async ({
  id,
}: GetEmployeeLeaveByIdInput) => {
  const employeeLeave = await prisma.employeeLeave.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      user: {
        select: {
          // Minimal user
          id: true,
          firstName: true,
          lastName: true,
          dni: true,
        },
      },
      startDate: true,
      endDate: true,
      reason: true,
      isActive: true,
    },
  });

  if (!employeeLeave) {
    throw new AppError("Permiso administrativo no encontrado", 404);
  }

  return employeeLeave;
};

export const createEmployeeLeaveService = async (
  data: CreateEmployeeLeaveInput
) => {
  const { userId, startDate, endDate, ...restData } = data;

  // Convertir strings a Date objects
  const leaveStart = new Date(startDate);
  const leaveEnd = new Date(endDate);

  console.log("Creating employee leave:", {
    leaveStart: leaveStart.toISOString(),
    leaveEnd: leaveEnd.toISOString(),
    userId,
  });

  return await prisma.$transaction(async (tx) => {
    // 1. Validar que el usuario existe, está activo y tiene el rol correcto
    const userDb = await tx.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userDb || !userDb.isActive) {
      throw new AppError("Usuario no encontrado o inactivo", 404);
    }

    // 2. Validar que no hay conflicto con otros permisos activos del psicólogo
    const leaveConflict = await tx.employeeLeave.findFirst({
      where: {
        userId: userId,
        isActive: true,
        OR: [
          // Nuevo permiso comienza durante uno existente
          {
            AND: [
              { startDate: { lte: leaveStart } },
              { endDate: { gt: leaveStart } },
            ],
          },
          // Nuevo permiso termina durante uno existente
          {
            AND: [
              { startDate: { lt: leaveEnd } },
              { endDate: { gte: leaveEnd } },
            ],
          },
          // Nuevo permiso engloba uno existente
          {
            AND: [
              { startDate: { gte: leaveStart } },
              { endDate: { lte: leaveEnd } },
            ],
          },
        ],
      },
    });

    if (leaveConflict) {
      throw new AppError(
        `El usuario ya tiene un permiso administrativo activo de ${leaveConflict.startDate.toLocaleDateString()} a ${leaveConflict.endDate.toLocaleDateString()}`,
        409
      );
    }

    // 3. Validar que no hay citas programadas en ese rango de fechas

    if (userDb.roles.some((r) => r.role.name === "PSYCHOLOGIST")) {
      const appointmentsConflict = await tx.appointment.findFirst({
        where: {
          userId: userId,
          status: {
            in: [AppointmentStatus.PENDING, AppointmentStatus.DONE],
          },
          OR: [
            // Cita comienza durante el permiso
            {
              AND: [
                { startDate: { gte: leaveStart } },
                { startDate: { lt: leaveEnd } },
              ],
            },
            // Cita termina durante el permiso
            {
              AND: [
                { endDate: { gt: leaveStart } },
                { endDate: { lte: leaveEnd } },
              ],
            },
            // Cita engloba el permiso
            {
              AND: [
                { startDate: { lte: leaveStart } },
                { endDate: { gte: leaveEnd } },
              ],
            },
          ],
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (appointmentsConflict) {
        throw new AppError(
          `El psicólogo seleccionado tiene citas programadas para estas fechas. Conflicto: ${appointmentsConflict.startDate.toLocaleDateString()} con ${appointmentsConflict.patient.firstName
          } ${appointmentsConflict.patient.lastName}`,
          409
        );
      }
    }

    // Crear el permiso
    const employeeLeaveCreated = await tx.employeeLeave.create({
      data: {
        startDate: leaveStart,
        endDate: leaveEnd,
        isActive: true,
        user: {
          connect: { id: userId },
        },
        reason: restData.reason,
      },
    });

    return employeeLeaveCreated;
  });
};

export const updateEmployeeLeaveService = async (
  data: UpdateEmployeeLeaveInput
) => {
  const { id } = data.params;
  const { startDate, endDate, isActive, ...restData } = data.body;

  return await prisma.$transaction(async (tx) => {
    // 1. Verificar que el employee leave existe y está activo
    const existingEmployeeLeave = await tx.employeeLeave.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
    });

    if (!existingEmployeeLeave) {
      throw new AppError("Permiso administrativo no encontrado", 404);
    }

    if (!existingEmployeeLeave.isActive) {
      throw new AppError(
        "No es posible editar un permiso administrativo cancelado",
        400
      );
    }
    /* 
    // 2. Validar que el psicólogo sigue activo
    if (!existingEmployeeLeave.user.isActive) {
      throw new AppError("Usuario no activo", 400);
    } */

    // 3. Si se están actualizando las fechas, validar conflictos
    const isUpdatingDates = startDate || endDate;

    if (isUpdatingDates) {
      // Usar las nuevas fechas si se proporcionan, sino usar las existentes
      const newStartDate = startDate
        ? new Date(startDate)
        : existingEmployeeLeave.startDate;
      const newEndDate = endDate
        ? new Date(endDate)
        : existingEmployeeLeave.endDate;

      console.log("Validating date changes:", {
        newStartDate: newStartDate.toISOString(),
        newEndDate: newEndDate.toISOString(),
        userId: existingEmployeeLeave.userId,
      });

      // 3.1. Validar que no hay conflicto con otros permisos activos del psicólogo
      const leaveConflict = await tx.employeeLeave.findFirst({
        where: {
          id: { not: id }, // Excluir el permiso actual
          userId: existingEmployeeLeave.userId,
          isActive: true,
          OR: [
            // Nuevo rango comienza durante otro permiso existente
            {
              AND: [
                { startDate: { lte: newStartDate } },
                { endDate: { gt: newStartDate } },
              ],
            },
            // Nuevo rango termina durante otro permiso existente
            {
              AND: [
                { startDate: { lt: newEndDate } },
                { endDate: { gte: newEndDate } },
              ],
            },
            // Nuevo rango engloba otro permiso existente
            {
              AND: [
                { startDate: { gte: newStartDate } },
                { endDate: { lte: newEndDate } },
              ],
            },
          ],
        },
      });

      if (leaveConflict) {
        throw new AppError(
          `El usuario tiene un permiso administrativo activo de ${leaveConflict.startDate.toLocaleDateString()} a ${leaveConflict.endDate.toLocaleDateString()}`,
          409
        );
      }

      // 3.2. Validar que no hay citas programadas en el nuevo rango de fechas
      const appointmentsConflict = await tx.appointment.findFirst({
        where: {
          userId: existingEmployeeLeave.userId,
          status: {
            in: [AppointmentStatus.PENDING, AppointmentStatus.DONE],
          },
          OR: [
            // Cita comienza durante el permiso
            {
              AND: [
                { startDate: { gte: newStartDate } },
                { startDate: { lt: newEndDate } },
              ],
            },
            // Cita termina durante el permiso
            {
              AND: [
                { endDate: { gt: newStartDate } },
                { endDate: { lte: newEndDate } },
              ],
            },
            // Cita engloba el permiso
            {
              AND: [
                { startDate: { lte: newStartDate } },
                { endDate: { gte: newEndDate } },
              ],
            },
          ],
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (appointmentsConflict) {
        throw new AppError(
          `El psicólogo tiene citas agendadas en las fechas seleccionadas. Conflicto: ${appointmentsConflict.startDate.toLocaleDateString()} con ${appointmentsConflict.patient.firstName
          } ${appointmentsConflict.patient.lastName}`,
          409
        );
      }
    }

    // 4. Actualizar el employee leave
    const employeeLeaveUpdated = await tx.employeeLeave.update({
      where: { id },
      data: {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...restData,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
        startDate: true,
        endDate: true,
        reason: true,
        isActive: true,
      },
    });

    // Si desactivaron el permiso (isActive = false), reactivar usuario
    if (isActive === false) {
      console.log("reactivando user");
      const otherActiveCount = await tx.employeeLeave.count({
        where: {
          userId: employeeLeaveUpdated.user.id,
          isActive: true,
          id: { not: id },
        },
      });

      if (otherActiveCount === 0) {
        await tx.user.update({
          where: { id: employeeLeaveUpdated.user.id },
          data: { isActive: true },
        });
      }
    }

    console.log(
      "Employee leave updated successfully:",
      employeeLeaveUpdated.id
    );
    return employeeLeaveUpdated;
  });
};

export const updateEmployeeLeaveStatusService = async (
  data: UpdateEmployeeLeaveStatusInput
) => {
  const { id } = data.params;
  const { isActive } = data.body;

  // Verificar que el employee leave existe
  const existingEmployeeLeave = await prisma.employeeLeave.findUnique({
    where: { id },
  });

  if (!existingEmployeeLeave) {
    throw new AppError("Permiso administrativo no encontrado", 404);
  }

  // Actualizar solo los campos del EmployeeLeave (sin userId)
  const updatedEmployeeLeave = await prisma.employeeLeave.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      user: {
        select: {
          // Minimal user
          id: true,
          firstName: true,
          lastName: true,
          dni: true,
        },
      },
      startDate: true,
      endDate: true,
      reason: true,
      isActive: true,
    },
  });

  // Si desactivan/cancelan el permiso -> reactivar usuario solo si no tiene otros permisos activos
  const otherActiveCount = await prisma.employeeLeave.count({
    where: {
      userId: updatedEmployeeLeave.user.id,
      isActive: true,
      id: { not: id },
    },
  });

  if (otherActiveCount === 0) {
    console.log("reactivando user");
    await prisma.user.update({
      where: { id: updatedEmployeeLeave.user.id },
      data: { isActive: true },
    });
  }

  return updatedEmployeeLeave;
};

export const getEmployeeLeavesByUserIdService = async (
  data: GetEmployeeLeavesByUserIdInput
) => {
  const { id } = data.params;
  const { page, take } = data.query;

  // Verificar que el usuario existe
  const userExists = await prisma.user.findUnique({
    where: { id },
  });

  if (!userExists) {
    throw new AppError("Uusario no encontrado", 404);
  }

  const employeeLeaves = await prisma.employeeLeave.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      userId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      document: true,
    },
  });

  const employeeLeavesToReturn = await Promise.all(
    employeeLeaves.map(async (leave) => {
      if (!leave.document?.filePath) {
        return leave;
      }

      const fileUrl = await getUrlFileByFilePath(leave.document.filePath);

      return {
        ...leave,
        document: {
          ...leave.document,
          fileUrl,
        },
      };
    })
  );

  const totalCount = await prisma.employeeLeave.count({
    where: {
      userId: id,
    },
  });

  const totalPages = Math.ceil(totalCount / take!);

  return {
    currentPage: page!,
    totalPages,
    employeeLeaves: employeeLeavesToReturn,
  };
};
