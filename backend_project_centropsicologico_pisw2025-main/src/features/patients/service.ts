import { AppError } from "../../common/utils";
import { PatientMinimal } from "../../interfaces";
import prisma from "../../lib/prisma";
import {
  CreatePatientInput,
  GetAllPatientsPaginatedInput,
  GetAllPatientsSearchInput,
  GetMyPatientListInput,
  GetPatientByAppointmentIdInput,
  GetPatientByIdInput,
  GetPatientsByPsychologistIdInput,
  UpdatePatientInput,
} from "./schema";

export const getAllPatientsPaginatedService = async ({
  page,
  search,
  take,
}: GetAllPatientsPaginatedInput) => {
  const patientsDB = await prisma.patient.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      dni: {
        startsWith: search,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      district: { select: { name: true } },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.patient.count({
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
    patients: patientsDB,
  };
};
export const getAllPatientsByPsychologistIdService = async ({
  params,
  query,
}: GetPatientsByPsychologistIdInput) => {
  const { page, search, take } = query;
  const { psychologistId } = params;

  const patientsDB = await prisma.patient.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      dni: {
        contains: search,
      },
      psychologistId: psychologistId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      clinicalHistory: { select: { id: true } },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.patient.count({
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
    patients: patientsDB,
  };
};

export const getAllPatientsSearchService = async ({
  dni,
  name,
}: GetAllPatientsSearchInput) => {
  console.log({ dni, name });

  // Construir las condiciones de búsqueda dinámicamente
  const searchConditions = [];

  // Solo agregar condiciones de nombre si no está vacío
  if (name && name.trim().length > 0) {
    searchConditions.push({
      firstName: {
        contains: name.trim(),
        mode: "insensitive" as const,
      },
    });

    searchConditions.push({
      lastName: {
        contains: name.trim(),
        mode: "insensitive" as const,
      },
    });
    searchConditions.push({
      dni: {
        contains: name.trim(),
        mode: "insensitive" as const,
      },
    });
  }

  // Si no hay condiciones de búsqueda, retornar array vacío o todos los pacientes
  if (searchConditions.length === 0) {
    return []; // O puedes retornar todos con un límite
  }

  const patientsDB = await prisma.patient.findMany({
    where: {
      OR: searchConditions,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      dni: true,
      id: true,
      firstName: true,
      lastName: true,
    },
    take: 10,
  });

  return patientsDB;
};

export const getPatientByIdService = async ({ id }: GetPatientByIdInput) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      district: {
        select: {
          id: true,
          name: true,
          province: {
            select: {
              id: true,
              name: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!patient) {
    throw new AppError("Paciente no encontrado", 404);
  }
  return patient;
};

export const getPatientByAppointmentIdService = async ({
  appointmentId,
}: GetPatientByAppointmentIdInput) => {
  const patient = await prisma.appointment
    .findUnique({
      where: { id: appointmentId },
      select: {
        patient: true,
      },
    })
    .then((appointment) => appointment?.patient);

  if (!patient) {
    throw new AppError("Paciente no encontrado", 404);
  }
  return patient;
};

export const createPatientService = async (data: CreatePatientInput) => {
  try {
    const patientCreated = await prisma.$transaction(async (tx) => {
      const { districtId, psychologistId, ...restData } = data;

      const clinicalHistory = await tx.clinicalHistory.create({ data: {} });

      const patient = await tx.patient.create({
        data: {
          ...restData,
          district: {
            connect: { id: districtId },
          },
          psychologist: psychologistId
            ? { connect: { id: psychologistId } }
            : undefined,
          clinicalHistory: {
            connect: { id: clinicalHistory.id },
          },
        },
      });

      return patient;
    });

    return patientCreated;
  } catch (error) {
    throw new AppError("Error creando el paciente", 400);
  }
};

export const updatePatientService = async (data: UpdatePatientInput) => {
  const { id } = data.params;

  const { districtId, psychologistId, ...restData } = data.body;

  const patientExists = await prisma.patient.findUnique({
    where: { id },
  });
  if (!patientExists) {
    throw new AppError("Paciente no encontrado", 404);
  }

  const dataToUpdate = {
    ...restData,
    ...(districtId && {
      district: {
        connect: { id: districtId },
      },
    }),
    ...(psychologistId !== undefined && {
      ...(psychologistId
        ? { psychologist: { connect: { id: psychologistId } } }
        : { psychologist: { disconnect: true } }),
    }),
  };
  const updatedPatient = await prisma.patient.update({
    where: { id },
    data: dataToUpdate,
    include: {
      district: { select: { name: true } },
    },
  });

  return updatedPatient;
};

export const getMyPatientListService = async ({
  params,
  query,
}: GetMyPatientListInput) => {
  const { page, search, take } = query;
  const { psychologistId } = params;

  const whereClause = {
    dni: {
      contains: search,
    },
    appointments: {
      some: {
        userId: psychologistId,
      },
    },
  };

  const patientsDB = await prisma.patient.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      clinicalHistory: { select: { id: true } },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.patient.count({
      where: whereClause,
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    patients: patientsDB,
  };
};

export const getPatientsForExcelService = async () => {
  return prisma.patient.findMany({
    select: {
      firstName: true,
      lastName: true,
      dni: true,
      gender: true,
      birthdate: true,
      educationLevel: true,
      birthPlace: true,
      occupation: true,
      address: true,
      maritalStatus: true,
      religion: true,
      occupationLocation: true,
      phoneNumber: true,
      parentFullName: true,
      parentDni: true,
      parentPhoneNumber: true,
    },
    orderBy: {
      lastName: "asc",
    },
  });
};