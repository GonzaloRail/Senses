import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import {
  CreateWorkScheduleInput,
  GetAllWorkSchedulesInput,
  GetWorkScheduleByIdInput,
  GetWorkSchedulesByUserIdInput,
  UpdateWorkScheduleInput,
} from "./schema";

export const createWorkScheduleService = async (
  data: CreateWorkScheduleInput
) => {
  const { userId, officeId, ...restData } = data;

  // Verificar que el usuario existe
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!userExists) {
    throw new AppError("Usuario no encontrado", 404);
  }

  // Verificar que la oficina existe
  const officeExists = await prisma.office.findUnique({
    where: { id: officeId },
  });
  if (!officeExists) {
    throw new AppError("Oficina no encontrada", 404);
  }

  const workScheduleCreated = await prisma.workSchedule.create({
    data: {
      ...restData,
      user: {
        connect: { id: userId },
      },
      office: {
        connect: { id: officeId },
      },
    },
    include: {
      user: true,
      office: true,
    },
  });

  if (!workScheduleCreated) {
    throw new AppError("Error creando el horario de trabajo", 500);
  }

  return workScheduleCreated;
};

export const getAllWorkSchedulesService = async ({
  page,
  take,
}: GetAllWorkSchedulesInput) => {
  const workSchedulesDb = await prisma.workSchedule.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          dni: true,
        },
      },
      office: true,
    },
  });

  const totalCount = await prisma.workSchedule.count();
  const totalPages = Math.ceil(totalCount / take!);

  return {
    currentPage: page!,
    totalPages,
    workSchedules: workSchedulesDb,
  };
};

export const getWorkScheduleByIdService = async ({
  id,
}: GetWorkScheduleByIdInput) => {
  const workSchedule = await prisma.workSchedule.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          dni: true,
        },
      },
      office: true,
    },
  });

  if (!workSchedule) {
    throw new AppError("Horario de trabajo no encontrado", 404);
  }

  return workSchedule;
};

export const getWorkSchedulesByUserIdService = async (
  data: GetWorkSchedulesByUserIdInput
) => {
  const { id } = data.params;
  const { page, take } = data.query;

  const userExists = await prisma.user.findUnique({
    where: { id },
  });

  if (!userExists) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const workSchedules = await prisma.workSchedule.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      userId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          dni: true,
        },
      },
      office: true,
    },
  });

  const totalCount = await prisma.workSchedule.count({
    where: {
      userId: id,
    },
  });

  const totalPages = Math.ceil(totalCount / take!);

  return {
    currentPage: page!,
    totalPages,
    workSchedules,
  };
};

export const updateWorkScheduleService = async (
  data: UpdateWorkScheduleInput
) => {
  const { id } = data.params;
  const { userId, officeId, ...restData } = data.body;

  // Verificar que el WorkSchedule existe
  const existingWorkSchedule = await prisma.workSchedule.findUnique({
    where: { id },
  });

  if (!existingWorkSchedule) {
    throw new AppError("Horario de trabajo no encontrado", 404);
  }

  // Verificar userId si se envía
  if (userId) {
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new AppError("Usuario no encontrado", 404);
  }

  // Verificar officeId si se envía
  if (officeId) {
    const officeExists = await prisma.office.findUnique({
      where: { id: officeId },
    });
    if (!officeExists) throw new AppError("Oficina no encontrada", 404);
  }

  // Preparar datos para actualización
  const updateData: any = {
    ...restData,
    ...(userId && { user: { connect: { id: userId } } }),
    ...(officeId && { office: { connect: { id: officeId } } }),
  };

  // Actualizar y devolver con relaciones
  const updated = await prisma.workSchedule.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          dni: true,
        },
      },
      office: true,
    },
  });

  return updated;
};
