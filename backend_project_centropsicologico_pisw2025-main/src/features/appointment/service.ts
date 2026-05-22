import { AppointmentStatus, RoleType } from "@prisma/client";
import { AppointmentForTable } from "../../apiResponses/AppointmentForTable";
import { AppError } from "../../common/utils";
import { AppointmentEvent } from "../../interfaces";
import prisma from "../../lib/prisma";
import {
  CreateAppointmentInput,
  GetAllAppointmentsPaginatedInput,
  GetAppointmentByIdInput,
  GetAppointmentsByEntityIdInput,
  UpdateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "./schema";
import { buildWhereClause, validateEntityExists } from "./utils";
import { AppointmentViewResponse } from "../../interfaces";
import { startOfDay, endOfDay } from "date-fns";

export const getAllAppointmentsPaginatedService = async ({
  page,
  take,
  search
}: GetAllAppointmentsPaginatedInput) => {
  console.log(search)
  const q = typeof search === "string" ? search.trim() : "";

  // Construir where dinámico
  const where: any = {};
  if (q.length > 0) {
    where.patient = {
      dni: {
        contains: q,
        mode: "insensitive",
      },
    };
  }
  const appointmentsDb = await prisma.appointment.findMany({
    where,
    take: take!,
    skip: (page! - 1) * take!,
    orderBy: {
      startDate: "desc",
    },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          dni: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const content: AppointmentForTable[] = appointmentsDb.map((appointment) => {
    return {
      id: appointment.id,
      patientName: appointment.patient.firstName + " " + appointment.patient.lastName,
      psychologistName: appointment.user.firstName + " " + appointment.user.lastName,
      startDateTime: appointment.startDate,
      status: appointment.status,
    };
  });
  const totalPages = Math.ceil((await prisma.appointment.count()) / take!);
  return {
    currentPage: page!,
    totalPages,
    appointments: content,
  };
};

export const getAppointmentByIdService = async ({
  id,
}: GetAppointmentByIdInput) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      reason: true,
      status: true,
      type: true,
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dni: true,
        },
      },
      office: {
        include: {
          location: {
            select: {
              name: true,
              address: true,
              id: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dni: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new AppError("La cita no fue encontrada", 404);
  }

  const appointmentResponse: AppointmentViewResponse = {
    ...appointment,
    startDate: appointment.startDate.toISOString(),
    endDate: appointment.endDate.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    patient: {
      id: appointment.patient.id,
      firstName: appointment.patient.firstName,
      lastName: appointment.patient.lastName,
      dni: appointment.patient.dni,
    },
    user: {
      id: appointment.user.id,
      firstName: appointment.user.firstName,
      lastName: appointment.user.lastName,
      dni: appointment.user.dni,
    },
    office: {
      id: appointment.office.id,
      name: appointment.office.name,
      type: appointment.office.type,
      capacity: appointment.office.capacity,
      location: {
        id: appointment.office.location.id,
        name: appointment.office.location.name,
        address: appointment.office.location.address,
      },
    },
  };

  return appointmentResponse;
};

export const createAppointmentService = async (
  data: CreateAppointmentInput
) => {
  const {
    officeId,
    psychologistId,
    patientId,
    startDate,
    endDate,
    ...restData
  } = data;

  // Convertir strings a Date objects
  const appointmentStart = new Date(startDate);
  const appointmentEnd = new Date(endDate);

  console.log("Creating appointment:", {
    appointmentStart: appointmentStart.toISOString(),
    appointmentEnd: appointmentEnd.toISOString(),
    psychologistId,
    officeId,
    patientId,
  });

  return await prisma.$transaction(async (tx) => {
    // 1. Validar que el paciente existe y está activo
    const patient = await tx.patient.findUnique({
      where: { id: patientId },
      select: { id: true, firstName: true, lastName: true, isActive: true },
    });

    if (!patient || !patient.isActive) {
      throw new AppError("El paciente no fue encontrado o inactivo", 404);
    }

    // 2. Validar que el psicólogo existe, está activo y tiene el rol correcto
    const psychologist = await tx.user.findUnique({
      where: { id: psychologistId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!psychologist || !psychologist.isActive) {
      throw new AppError("Psicólogo no encontrado o inactivo", 404);
    }

    const isPsychologist = psychologist.roles.some(
      (userRole) => userRole.role.name === RoleType.PSYCHOLOGIST // Ajustar según tu enum
    );

    if (!isPsychologist) {
      throw new AppError("Psicólogo no válido", 400);
    }

    // 3. Validar que la oficina existe y está activa
    const office = await tx.office.findUnique({
      where: { id: officeId },
      select: { id: true, name: true, isActive: true },
    });

    if (!office || !office.isActive) {
      throw new AppError("Oficina no válida", 404);
    }

    // 4. Validar que no hay conflicto con otras citas del psicólogo
    const psychologistConflict = await tx.appointment.findFirst({
      where: {
        userId: psychologistId,
        status: { not: AppointmentStatus.CANCELED },
        OR: [
          // Nueva cita comienza durante una existente
          {
            AND: [
              { startDate: { lte: appointmentStart } },
              { endDate: { gt: appointmentStart } },
            ],
          },
          // Nueva cita termina durante una existente
          {
            AND: [
              { startDate: { lt: appointmentEnd } },
              { endDate: { gte: appointmentEnd } },
            ],
          },
          // Nueva cita engloba una existente
          {
            AND: [
              { startDate: { gte: appointmentStart } },
              { endDate: { lte: appointmentEnd } },
            ],
          },
        ],
      },
    });

    if (psychologistConflict) {
      throw new AppError(
        `El psícogolo ya tiene una cita agendada en la fecha:  ${psychologistConflict.startDate} al ${psychologistConflict.endDate}`,
        409
      );
    }

    // 5. Validar que no hay conflicto con otras citas en la oficina
    const officeConflict = await tx.appointment.findFirst({
      where: {
        officeId: officeId,
        status: { not: AppointmentStatus.CANCELED },
        OR: [
          {
            AND: [
              { startDate: { lte: appointmentStart } },
              { endDate: { gt: appointmentStart } },
            ],
          },
          {
            AND: [
              { startDate: { lt: appointmentEnd } },
              { endDate: { gte: appointmentEnd } },
            ],
          },
          {
            AND: [
              { startDate: { gte: appointmentStart } },
              { endDate: { lte: appointmentEnd } },
            ],
          },
        ],
      },
    });

    if (officeConflict) {
      throw new AppError(
        `La oficina seleccionada ya está reservada desde ${officeConflict.startDate} a ${officeConflict.endDate}`,
        409
      );
    }

    // 6. Validar que el psicólogo no está de permiso en ese rango de fechas
    const employeeLeaveConflict = await tx.employeeLeave.findFirst({
      where: {
        userId: psychologistId,
        isActive: true,
        OR: [
          // Nueva cita comienza durante un permiso existente
          {
            AND: [
              { startDate: { lte: appointmentStart } },
              { endDate: { gt: appointmentStart } },
            ],
          },
          // Nueva cita termina durante un permiso existente
          {
            AND: [
              { startDate: { lt: appointmentEnd } },
              { endDate: { gte: appointmentEnd } },
            ],
          },
          // Nueva cita engloba un permiso existente
          {
            AND: [
              { startDate: { gte: appointmentStart } },
              { endDate: { lte: appointmentEnd } },
            ],
          },
        ],
      },
    });

    if (employeeLeaveConflict) {
      throw new AppError(
        `El psicólogo está de permiso del ${employeeLeaveConflict.startDate.toLocaleDateString()} al ${employeeLeaveConflict.endDate.toLocaleDateString()}`,
        409
      );
    }

    // 7. Crear la cita
    const appointmentCreated = await tx.appointment.create({
      data: {
        startDate: appointmentStart,
        endDate: appointmentEnd,
        ...restData,
        office: {
          connect: { id: officeId },
        },
        user: {
          connect: { id: psychologistId },
        },
        patient: {
          connect: { id: patientId },
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
        office: {
          select: {
            id: true,
            name: true,
            location: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    console.log("Appointment created successfully:", appointmentCreated.id);
    return appointmentCreated;
  });
};

export const updateAppointmentService = async ({
  params,
  body,
}: UpdateAppointmentInput) => {
  const { id } = params;
  const {
    officeId,
    psychologistId,
    patientId,
    startDate,
    endDate,
    ...restData
  } = body;

  return await prisma.$transaction(async (tx) => {
    // 1. Verificar que la cita existe
    const existingAppointment = await tx.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        userId: true,
        officeId: true,
        patientId: true,
      },
    });

    if (!existingAppointment) {
      throw new AppError("La cita no existe", 404);
    }

    // 2. No permitir editar citas canceladas
    if (existingAppointment.status === AppointmentStatus.CANCELED) {
      throw new AppError("No se puede editar citas canceladas", 400);
    }

    // Usar valores existentes si no se proporcionan nuevos
    const appointmentStart = startDate
      ? new Date(startDate)
      : existingAppointment.startDate;
    const appointmentEnd = endDate
      ? new Date(endDate)
      : existingAppointment.endDate;
    const finalPsychologistId = psychologistId || existingAppointment.userId;
    const finalOfficeId = officeId || existingAppointment.officeId;
    const finalPatientId = patientId || existingAppointment.patientId;

    console.log("Updating appointment:", {
      id,
      appointmentStart: appointmentStart.toISOString(),
      appointmentEnd: appointmentEnd.toISOString(),
      psychologistId: finalPsychologistId,
      officeId: finalOfficeId,
      patientId: finalPatientId,
    });

    // 3. Validar que el paciente existe y está activo (si cambió)
    if (patientId && patientId !== existingAppointment.patientId) {
      const patient = await tx.patient.findUnique({
        where: { id: patientId },
        select: { id: true, isActive: true },
      });

      if (!patient || !patient.isActive) {
        throw new AppError("Paciente no encontrado o inactivo", 404);
      }
    }

    // 4. Validar que el psicólogo existe, está activo y tiene el rol correcto (si cambió)
    if (psychologistId && psychologistId !== existingAppointment.userId) {
      const psychologist = await tx.user.findUnique({
        where: { id: psychologistId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!psychologist || !psychologist.isActive) {
        throw new AppError("Psicólogo no encontrado o inactivo", 404);
      }

      const isPsychologist = psychologist.roles.some(
        (userRole) => userRole.role.name === RoleType.PSYCHOLOGIST
      );

      if (!isPsychologist) {
        throw new AppError("El usuario no es un psicólogo válido", 400);
      }
    }

    // 5. Validar que la oficina existe y está activa (si cambió)
    if (officeId && officeId !== existingAppointment.officeId) {
      const office = await tx.office.findUnique({
        where: { id: officeId },
        select: { id: true, isActive: true },
      });

      if (!office || !office.isActive) {
        throw new AppError("Oficina no encontrada o inactiva", 404);
      }
    }

    // 6. Validar que no hay conflicto con otras citas del psicólogo
    // (excluyendo la cita actual)
    const psychologistConflict = await tx.appointment.findFirst({
      where: {
        id: { not: id }, // Excluir la cita actual
        userId: finalPsychologistId,
        status: { not: AppointmentStatus.CANCELED },
        OR: [
          {
            AND: [
              { startDate: { lte: appointmentStart } },
              { endDate: { gt: appointmentStart } },
            ],
          },
          {
            AND: [
              { startDate: { lt: appointmentEnd } },
              { endDate: { gte: appointmentEnd } },
            ],
          },
          {
            AND: [
              { startDate: { gte: appointmentStart } },
              { endDate: { lte: appointmentEnd } },
            ],
          },
        ],
      },
    });

    if (psychologistConflict) {
      throw new AppError(
        `El psicólogo ya tiene una cita de ${psychologistConflict.startDate} a ${psychologistConflict.endDate}`,
        409
      );
    }

    // 7. Validar que no hay conflicto con otras citas en la oficina
    // (excluyendo la cita actual)
    const officeConflict = await tx.appointment.findFirst({
      where: {
        id: { not: id }, // Excluir la cita actual
        officeId: finalOfficeId,
        status: { not: AppointmentStatus.CANCELED },
        OR: [
          {
            AND: [
              { startDate: { lte: appointmentStart } },
              { endDate: { gt: appointmentStart } },
            ],
          },
          {
            AND: [
              { startDate: { lt: appointmentEnd } },
              { endDate: { gte: appointmentEnd } },
            ],
          },
          {
            AND: [
              { startDate: { gte: appointmentStart } },
              { endDate: { lte: appointmentEnd } },
            ],
          },
        ],
      },
    });

    if (officeConflict) {
      throw new AppError(
        `La oficina ya está reservada de ${officeConflict.startDate} a ${officeConflict.endDate}`,
        409
      );
    }

    // 8. Validar que el psicólogo no está de permiso en ese rango de fechas
    const employeeLeaveConflict = await tx.employeeLeave.findFirst({
      where: {
        userId: finalPsychologistId,
        isActive: true,
        OR: [
          // Nueva cita comienza durante un permiso existente
          {
            AND: [
              { startDate: { lte: appointmentStart } },
              { endDate: { gt: appointmentStart } },
            ],
          },
          // Nueva cita termina durante un permiso existente
          {
            AND: [
              { startDate: { lt: appointmentEnd } },
              { endDate: { gte: appointmentEnd } },
            ],
          },
          // Nueva cita engloba un permiso existente
          {
            AND: [
              { startDate: { gte: appointmentStart } },
              { endDate: { lte: appointmentEnd } },
            ],
          },
        ],
      },
    });

    if (employeeLeaveConflict) {
      throw new AppError(
        `El psicólogo está de permiso del ${employeeLeaveConflict.startDate.toLocaleDateString()} al ${employeeLeaveConflict.endDate.toLocaleDateString()}`,
        409
      );
    }

    // 9. Actualizar la cita
    const updatedAppointment = await tx.appointment.update({
      where: { id },
      data: {
        ...(startDate && { startDate: appointmentStart }),
        ...(endDate && { endDate: appointmentEnd }),
        ...(psychologistId && { userId: psychologistId }),
        ...(officeId && { officeId }),
        ...(patientId && { patientId }),
        ...restData,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
        office: {
          select: {
            id: true,
            name: true,
            location: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    console.log("Appointment updated successfully:", updatedAppointment.id);
    return updatedAppointment;
  });
};

// export const getAppointmentsByPatientIdService = async (
//   data: GetAppointmentsByPatientIdInput
// ) => {
//   const { id } = data.params;
//   const { page, take } = data.query;

//   const patient = await prisma.patient.findUnique({
//     where: {
//       id,
//     },
//   });

//   if (!patient) {
//     throw new AppError("User does not exists", 404);
//   }

//   const appointmentsByPatientId = await prisma.appointment.findMany({
//     take: take!,
//     skip: (page! - 1) * take!,
//     where: {
//       patientId: id,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//     include: {
//       patient: true,
//     },
//   });
//   const totalPages = Math.ceil(
//     (await prisma.appointment.count({
//       where: {
//         patientId: id,
//       },
//     })) / take!
//   );
//   return {
//     currentPage: page!,
//     totalPages,
//     appointments: appointmentsByPatientId,
//   };
// };

export const updateAppointmentStatusService = async (
  data: UpdateAppointmentStatusInput
) => {
  const { id } = data.params;
  const { status } = data.body;

  const appointmentUpdated = await prisma.appointment.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return appointmentUpdated;
};

export type AppointmentFilterType = "patient" | "office" | "psychologist";

export interface GetAppointmentsInput {
  params: { id: string };
  filterType: AppointmentFilterType;
}

export const getAppointmentsByFilterService = async (
  data: GetAppointmentsInput
) => {
  const { id } = data.params;
  const { filterType } = data;

  // Validar que la entidad relacionada existe
  await validateEntityExists(id, filterType);

  // Construir el filtro dinámicamente
  const whereClause = buildWhereClause(id, filterType);

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "asc",
    },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      office: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const appointmentsProcessed: AppointmentEvent[] = appointments.map(
    (appointment) => ({
      title: appointment.reason,
      startDate: appointment.startDate,
      endDate: appointment.endDate,
      resource: {
        id: appointment.id,
        officeName: appointment.office.name,
        psychologistName: `${appointment.user.firstName} ${appointment.user.lastName}`,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        status: appointment.status,
        type: appointment.type,
      },
    })
  );

  return appointmentsProcessed;
};

export const getAppointmentsByPatientIdService = async (
  data: GetAppointmentsByEntityIdInput
) => {
  const { id } = data.params;
  return getAppointmentsByFilterService({
    params: {
      id,
    },

    filterType: "patient",
  });
};

export const getAppointmentsByOfficeIdService = async (
  data: GetAppointmentsByEntityIdInput
) => {
  const { id } = data.params;
  return getAppointmentsByFilterService({
    params: {
      id,
    },

    filterType: "office",
  });
};

export const getAppointmentsByPsychologistIdService = async (
  data: GetAppointmentsByEntityIdInput
) => {
  const { id } = data.params;
  return getAppointmentsByFilterService({
    params: {
      id,
    },

    filterType: "psychologist",
  });
};

interface GetAppointmentsByDateInput {
  from?: string;
  to?: string;
  page: number;
  take: number;
}

export const getAppointmentsByDateService = async ({
  from,
  to,
  page,
  take,
}: GetAppointmentsByDateInput) => {

  const dateFilter: any = {};

  if (from) {
    dateFilter.gte = new Date(from);
  }

  if (to) {
    dateFilter.lte = new Date(to);
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      status: {
        in: ["PENDING", "IN_PROGRESS"],
      },
      ...(from || to ? { startDate: dateFilter } : {}),
    },
    take,
    skip: (page - 1) * take,
    orderBy: {
      startDate: "asc",
    },
    select: {
      id: true,
      startDate: true,
      status: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        }
      },
      patient: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const transformed = appointments.map((a) => ({
    id: a.id,
    startDate: a.startDate,
    status: a.status,
    patientName: `${a.patient.firstName} ${a.patient.lastName}`,
    psychologistName: a.user.firstName + " " + a.user.lastName,
  }));

  const totalPages = Math.ceil((appointments.length) / take!);

  return {
    currentPage: page!,
    totalPages,
    appointments: transformed,
  };
};

interface GetAppointmentsListServiceInput {
  psychologistId: string;
  from?: string;
  to?: string;
  page: number;
  take: number;
}

export const getAppointmentsListService = async ({
  psychologistId,
  from,
  to,
  page,
  take,
}: GetAppointmentsListServiceInput) => {

  const dateFilter: any = {};

  if (from) {
    dateFilter.gte = new Date(from);
  }

  if (to) {
    dateFilter.lte = new Date(to);
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      userId: psychologistId,
      status: {
        in: ["PENDING", "IN_PROGRESS"],
      },
      ...(from || to ? { startDate: dateFilter } : {}),
    },
    take: take!,
    skip: (page! - 1) * take,
    orderBy: {
      startDate: "asc",
    },
    select: {
      id: true,
      startDate: true,
      status: true,
      patient: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const transformed = appointments.map((a) => ({
    id: a.id,
    startDate: a.startDate,
    status: a.status,
    patientName: `${a.patient.firstName} ${a.patient.lastName}`,
  }));

  const total = await prisma.appointment.count({
    where: {
      userId: psychologistId,
      status: {
        in: ["PENDING", "IN_PROGRESS"],
      },
      ...(from || to ? { startDate: dateFilter } : {}),
    },
  });

  const totalPages = Math.ceil(total / take!);

  return {
    currentPage: page!,
    totalPages,
    appointments: transformed,
  };
};
