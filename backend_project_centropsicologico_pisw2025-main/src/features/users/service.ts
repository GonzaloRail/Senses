import { AppointmentStatus, RoleType, WeekDay } from "@prisma/client";
import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import { sendEmail } from "../email/service";
import { activationEmailTemplate } from "../email/templates";
import type {
  CreateUserInput,
  GetAllUsersPaginatedInput,
  GetAvailablePsychologistsByDateAndNameInput,
  GetPsychologistByNameInput,
  GetUsersByNameInput,
  UpdateUserInput,
} from "./schema";
import { env } from "../../common/config";
import { generateSecureToken } from "../../common/utils/tokensAccountUtils";
import { getUrlFileByFilePath } from "../../common/utils/getUrlFileByFilePath";

export const createUserService = async (data: CreateUserInput) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (userExists) {
    throw new AppError("El usuario ya existe. Por favor, inicie sesión", 409);
  }
  const userCreated = await prisma.$transaction(async (tx) => {
    const { documents, roles, workSchedule, ...restData } = data;

    const user = await tx.user.create({
      data: {
        ...restData,
        password: "", // temporal until user verifies its account
        isActive: false,
        isEmailVerified: false,
      },
    });

    if (roles && roles.length > 0) {
      const userRoles = roles.map(({ roleId }) => ({
        userId: user.id,
        roleId,
      }));

      await tx.userRole.createMany({
        data: userRoles,
        skipDuplicates: true,
      });
    }

    if (documents && documents.length > 0) {
      const userDocuments = documents.map(({ name, type, filePath }) => ({
        userId: user.id,
        name,
        type,
        filePath,
      }));

      await tx.document.createMany({
        data: userDocuments,
      });
    }

    if (workSchedule && workSchedule.length > 0) {
      await checkScheduleOverlap(tx, workSchedule);

      const userWorkSchedules = workSchedule.map((schedule) => {
        const startTimeAsDate = new Date(`1970-01-01T${schedule.startTime}Z`);
        const endTimeAsDate = new Date(`1970-01-01T${schedule.endTime}Z`);

        return {
          day: schedule.day,
          officeId: schedule.officeId,
          userId: user.id,
          startTime: startTimeAsDate,
          endTime: endTimeAsDate,
        };
      });

      await tx.workSchedule.createMany({
        data: userWorkSchedules,
      });
    }

    // Refactor user creation

    const activationToken = generateSecureToken();

    await tx.authToken.create({
      data: {
        token: activationToken,
        type: "ACCOUNT_ACTIVATION",
        userId: user.id,
      },
    });

    const activationLink = `${env.FRONTEND_URL}/auth/activate-account?token=${activationToken}`;

    // service to send email

    // Email for activate its account
    const activationEmailHtml = activationEmailTemplate(
      `${user.firstName} ${user.lastName}`,
      user.email,
      activationLink
    );

    await sendEmail({
      subject: "Bienvenido a Senses Psicologo S.A.C.",
      to: user.email,
      html: activationEmailHtml,
    });
    ////////////////

    const { password, ...restUser } = user;
    return restUser;
  });

  return userCreated;
};

export const dayTranslations: { [key: string]: string } = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const checkScheduleOverlap = async (
  tx: any,
  schedules: any[],
  userId?: string
) => {
  for (const schedule of schedules) {
    const startTimeAsDate = new Date(`1970-01-01T${schedule.startTime}Z`);
    const endTimeAsDate = new Date(`1970-01-01T${schedule.endTime}Z`);

    const overlap = await tx.workSchedule.findFirst({
      where: {
        officeId: schedule.officeId,
        day: schedule.day,
        userId: {
          // Excluir al usuario actual solo si estamos en modo edición
          ...(userId && { not: userId }),
        },
        AND: [
          {
            startTime: {
              lt: endTimeAsDate,
            },
          },
          {
            endTime: {
              gt: startTimeAsDate,
            },
          },
        ],
      },
      include: {
        user: {
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
      },
    });

    if (overlap) {
      const diaEnEspanol = dayTranslations[schedule.day] || schedule.day;

      const incomingStartTime = schedule.startTime.slice(0, 5);
      const incomingEndTime = schedule.endTime.slice(0, 5);

      // Formatea la hora del horario existente
      const existingStartTime = overlap.startTime.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "UTC",
      });
      const existingEndTime = overlap.endTime.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "UTC",
      });

      throw new AppError(
        `El horario de ${incomingStartTime} a ${incomingEndTime} para el día ${diaEnEspanol} ` +
          `en el consultorio "${overlap.office.name}" no está disponible. ` +
          `Ya está ocupado por ${overlap.user.firstName} ${overlap.user.lastName} ` +
          `en el horario de ${existingStartTime} a ${existingEndTime}.`,
        400
      );
    }
  }
};

export const getUserByIdService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dni: true,
      email: true,
      csp: true,
      isActive: true,
      isEmailVerified: true,
      psychologistId: true,
      createdAt: true,
      updatedAt: true,
      psychologist: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dni: true,
          email: true,
        },
      },
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
      documents: {
        select: {
          id: true,
          name: true,
          type: true,
          fileUrl: true,
          filePath: true,
          bucketName: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      workSchedule: {
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          office: {
            select: {
              id: true,
              name: true,
              type: true,
              location: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: {
          day: "asc",
        },
      },
    },
  });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const documentsToReturn = await Promise.all(
    user.documents.map(async (doc) => {
      // Valida que filePath exista y no esté vacío
      if (!doc.filePath || doc.filePath.trim() === "") {
        console.warn(`⚠️ Documento ${doc.id} sin filePath`);
        return {
          ...doc,
          fileUrl: null,
        };
      }

      try {
        const fileUrl = await getUrlFileByFilePath(doc.filePath.trim());
        return {
          ...doc,
          fileUrl,
        };
      } catch (error) {
        console.error(`❌ Error obteniendo URL para ${doc.filePath}:`, error);
        return {
          ...doc,
          fileUrl: null,
        };
      }
    })
  );

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    dni: user.dni,
    email: user.email,
    csp: user.csp,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    psychologistId: user.psychologistId,
    psychologist: user.psychologist
      ? {
          id: user.psychologist.id,
          firstName: user.psychologist.firstName,
          lastName: user.psychologist.lastName,
          fullName: `${user.psychologist.firstName} ${user.psychologist.lastName}`,
          dni: user.psychologist.dni,
          email: user.psychologist.email,
        }
      : null,
    roles: user.roles.map(({ role }) => role),
    documents: documentsToReturn.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      fileUrl: doc.fileUrl,
      filePath: doc.filePath,
      bucketName: doc.bucketName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })),
    workSchedule: user.workSchedule.map((schedule) => ({
      id: schedule.id,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      office: schedule.office,
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getAllUsersService = async ({
  page,
  take,
  search,
}: GetAllUsersPaginatedInput) => {
  console.log({ page, take, search });
  const usersDB = await prisma.user.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      dni: {
        startsWith: search,
      },
    },
    include: {
      roles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.user.count({
      where: {
        dni: {
          startsWith: search,
        },
      },
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    users: usersDB.map(({ password, ...restUser }) => restUser),
  };
};
export const getAllPsychologistSmallService = async ({
  page,
  take,
  search,
}: GetAllUsersPaginatedInput) => {
  console.log({ page, take, search });
  const psychologistDb = await prisma.user.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      dni: {
        startsWith: search,
      },
      roles: {
        some: {
          role: {
            name: RoleType.PSYCHOLOGIST,
          },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
    },
  });

  const totalPages = Math.ceil(
    (await prisma.user.count({
      where: {
        dni: {
          startsWith: search,
        },
        roles: {
          some: {
            role: {
              name: RoleType.PSYCHOLOGIST,
            },
          },
        },
      },
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    psychologists: psychologistDb,
  };
};

export const updateUserService = async (data: UpdateUserInput) => {
  const { id } = data.params;

  const userExists = await prisma.user.findUnique({
    where: { id },
  });
  if (!userExists) {
    throw new AppError("Usuario no encontrado", 404);
  }
  const updatedUser = await prisma.$transaction(async (tx) => {
    const { documents, roles, workSchedule, ...restData } = data.body;
    const user = await tx.user.update({
      where: { id },
      data: restData,
      include: {
        roles: {
          select: {
            role: true,
          },
        },
        documents: true,
      },
    });
    if (roles && roles.length > 0) {
      const userRoles = roles.map(({ roleId }) => ({
        userId: user.id,
        roleId,
      }));
      await tx.userRole.deleteMany({
        where: { userId: user.id },
      });
      await tx.userRole.createMany({
        data: userRoles,
        skipDuplicates: true,
      });
    }
    if (documents && documents.length > 0) {
      const userDocuments = documents.map(({ name, type, filePath }) => ({
        userId: user.id,
        name,
        type,
        filePath,
      }));
      const namesToDelete = documents.map((doc) => doc.name);

      await tx.document.deleteMany({
        where: {
          userId: user.id,
          name: { in: namesToDelete },
        },
      });

      await tx.document.createMany({
        data: userDocuments,
        skipDuplicates: true,
      });
    }

    if (workSchedule) {
      await checkScheduleOverlap(tx, workSchedule, id);

      // eliminar todos los horarios de trabajo existentes para este usuario
      await tx.workSchedule.deleteMany({
        where: { userId: user.id },
      });

      if (workSchedule.length > 0) {
        const userWorkSchedules = workSchedule.map((schedule) => {
          const startTimeAsDate = new Date(`1970-01-01T${schedule.startTime}Z`);
          const endTimeAsDate = new Date(`1970-01-01T${schedule.endTime}Z`);

          return {
            day: schedule.day,
            officeId: schedule.officeId,
            userId: user.id,
            startTime: startTimeAsDate,
            endTime: endTimeAsDate,
          };
        });

        await tx.workSchedule.createMany({
          data: userWorkSchedules,
        });
      }
    }

    const { password, ...restUser } = user;
    return restUser;
  });
  return updatedUser;
};

export const getPsychologistsByNameService = async ({
  searchQuery,
}: GetPsychologistByNameInput) => {
  try {
    console.log("query", searchQuery);
    const psychologistsFound = await prisma.user.findMany({
      where: {
        isActive: true,

        roles: {
          some: {
            role: {
              name: RoleType.PSYCHOLOGIST,
            },
          },
        },

        ...(searchQuery && {
          OR: [
            {
              firstName: {
                contains: searchQuery,
                mode: "insensitive", // No distingue entre mayúsculas y minúsculas
              },
            },
            {
              lastName: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dni: true,
        workSchedule: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                id: true
              }
            },
          },
        },
      },
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
      take: 10,
    });

    //console.log("psyfpund: ", psychologistsFound)

    return psychologistsFound.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
      workSchedule: user.workSchedule,
      roles: user.roles
    }));
  } catch (error) {
    // Manejo de errores consistente con tus otros servicios
    console.error("Error fetching psychologists by name:", error);
    throw new AppError("Error en la consulta de psicólogos");
  }
};

export const getAvailablePsychologistsByDateAndNameService = async ({
  endDate,
  startDate,
  searchQuery,
  currentAppointmentId,
}: GetAvailablePsychologistsByDateAndNameInput) => {
  try {
    console.log("Raw input (UTC):", { startDate, endDate, searchQuery });

    // Obtener los días de la semana del rango de fechas (ajustar a GMT-5 solo para determinar el día)
    const getWeekDaysFromRange = (start: Date, end: Date): WeekDay[] => {
      const weekDays: WeekDay[] = [];

      // Convertir a hora local SOLO para determinar qué día de la semana es
      const PERU_OFFSET = -5 * 60 * 60 * 1000;
      const startLocal = new Date(start.getTime() + PERU_OFFSET);
      const endLocal = new Date(end.getTime() + PERU_OFFSET);

      const current = new Date(startLocal);

      while (current <= endLocal) {
        const dayIndex = current.getDay();
        const weekDayMap: { [key: number]: WeekDay } = {
          1: WeekDay.MONDAY,
          2: WeekDay.TUESDAY,
          3: WeekDay.WEDNESDAY,
          4: WeekDay.THURSDAY,
          5: WeekDay.FRIDAY,
        };

        const weekDay = weekDayMap[dayIndex];
        if (weekDay && !weekDays.includes(weekDay)) {
          weekDays.push(weekDay);
        }

        current.setDate(current.getDate() + 1);
      }

      return weekDays;
    };

    const requiredWeekDays = getWeekDaysFromRange(
      new Date(startDate),
      new Date(endDate)
    );

    console.log("Required weekdays:", requiredWeekDays);

    const availablePsychologists = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: RoleType.PSYCHOLOGIST,
            },
          },
        },
        isActive: true,
        ...(searchQuery && {
          OR: [
            {
              firstName: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
          ],
        }),
        // NO tener permisos de ausencia activos en el rango de fechas
        employeeLeaves: {
          none: {
            isActive: true,
            OR: [
              {
                startDate: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
              {
                endDate: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
              {
                AND: [
                  {
                    startDate: {
                      lte: new Date(startDate),
                    },
                  },
                  {
                    endDate: {
                      gte: new Date(endDate),
                    },
                  },
                ],
              },
            ],
          },
        },
        // NO tener citas programadas en el rango de fechas
        appointments: {
          none: {
            status: {
              not: AppointmentStatus.CANCELED,
            },
            ...(currentAppointmentId && { id: { not: currentAppointmentId } }),
            OR: [
              {
                startDate: {
                  gte: new Date(startDate),
                  lt: new Date(endDate),
                },
              },
              {
                endDate: {
                  gt: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
              {
                AND: [
                  {
                    startDate: {
                      lte: new Date(startDate),
                    },
                  },
                  {
                    endDate: {
                      gte: new Date(endDate),
                    },
                  },
                ],
              },
            ],
          },
        },
        // TENER días de trabajo habilitados para los días requeridos
        workSchedule: {
          some: {
            day: {
              in: requiredWeekDays,
            },
          },
        },
      },
      select: {
        firstName: true,
        id: true,
        lastName: true,
        dni: true,
        workSchedule: true,
      },
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
      take: 10,
    });

    console.log("Found psychologists:", availablePsychologists.length);

    // Filtrar por horarios de trabajo - COMPARAR TODO EN UTC
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const requestStartTime =
      startDateObj.getUTCHours() * 60 + startDateObj.getUTCMinutes();
    const requestEndTime =
      endDateObj.getUTCHours() * 60 + endDateObj.getUTCMinutes();

    // Detectar si el request cruza medianoche
    const crossesMidnight = requestEndTime < requestStartTime;

    console.log("Request time range (UTC minutes):", {
      requestStartTime,
      requestEndTime,
      crossesMidnight,
    });

    const filteredPsychologists = availablePsychologists.filter(
      (psychologist) => {
        const hasValidSchedule = psychologist.workSchedule.some((schedule) => {
          // Comparar horarios en UTC (minutos desde medianoche UTC)
          const scheduleStartTime =
            schedule.startTime.getUTCHours() * 60 +
            schedule.startTime.getUTCMinutes();
          const scheduleEndTime =
            schedule.endTime.getUTCHours() * 60 +
            schedule.endTime.getUTCMinutes();

          const dayMatches = requiredWeekDays.includes(schedule.day);

          let timeMatches = false;

          // Detectar si el horario del psicólogo cruza medianoche
          const scheduleCrossesMidnight = scheduleEndTime < scheduleStartTime;

          if (crossesMidnight && scheduleCrossesMidnight) {
            // Ambos cruzan medianoche - verificar solapamiento complejo
            timeMatches =
              scheduleStartTime <= requestStartTime ||
              scheduleEndTime >= requestEndTime;
          } else if (crossesMidnight && !scheduleCrossesMidnight) {
            // Solo el request cruza medianoche, el schedule no
            // El schedule debe cubrir desde requestStart hasta el final del día
            timeMatches =
              scheduleStartTime <= requestStartTime &&
              scheduleEndTime >= requestStartTime;
          } else if (!crossesMidnight && scheduleCrossesMidnight) {
            // Solo el schedule cruza medianoche, el request no
            // Verificar si el request cae dentro del rango del schedule
            timeMatches =
              (scheduleStartTime <= requestStartTime &&
                scheduleStartTime <= requestEndTime) ||
              (scheduleEndTime >= requestStartTime &&
                scheduleEndTime >= requestEndTime) ||
              (scheduleStartTime <= requestStartTime &&
                scheduleEndTime >= requestEndTime);
          } else {
            // Ninguno cruza medianoche - comparación simple
            timeMatches =
              scheduleStartTime <= requestStartTime &&
              scheduleEndTime >= requestEndTime;
          }

          console.log(`Schedule check for ${psychologist.firstName}:`, {
            day: schedule.day,
            dayMatches,
            scheduleStartTime: `${Math.floor(scheduleStartTime / 60)}:${(
              scheduleStartTime % 60
            )
              .toString()
              .padStart(2, "0")} UTC`,
            scheduleEndTime: `${Math.floor(scheduleEndTime / 60)}:${(
              scheduleEndTime % 60
            )
              .toString()
              .padStart(2, "0")} UTC`,
            requestStartTime: `${Math.floor(requestStartTime / 60)}:${(
              requestStartTime % 60
            )
              .toString()
              .padStart(2, "0")} UTC`,
            requestEndTime: `${Math.floor(requestEndTime / 60)}:${(
              requestEndTime % 60
            )
              .toString()
              .padStart(2, "0")} UTC`,
            crossesMidnight,
            scheduleCrossesMidnight,
            timeMatches,
            valid: dayMatches && timeMatches,
          });

          return dayMatches && timeMatches;
        });

        return hasValidSchedule;
      }
    );

    console.log("Filtered psychologists:", filteredPsychologists.length);

    return filteredPsychologists.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
    }));
  } catch (error) {
    console.error("Error fetching available psychologists:", error);
    throw new AppError("Error al obtener psicólogos disponibles");
  }
};
export const getUsersByNameService = async ({
  searchQuery,
}: GetUsersByNameInput) => {
  try {
    const usersFound = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(searchQuery && {
          OR: [
            {
              firstName: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      select: {
        firstName: true,
        id: true,
        lastName: true,
        dni: true,
        workSchedule: true,
      },
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
      take: 10,
    });

    return usersFound.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
    }));
  } catch (error) {
    console.error("Error fetching available psychologists:", error);
    throw new AppError("Error al obtener psicólogos disponibles");
  }
};
