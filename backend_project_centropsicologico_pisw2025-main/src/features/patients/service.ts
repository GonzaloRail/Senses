import type { Prisma } from "@prisma/client";
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

const normalizeSearch = (value?: string) =>
  value?.trim().replace(/\s+/g, " ") ?? "";

type PatientSearchFilters = {
  dni?: string;
  firstname?: string;
  lastname?: string;
};

const buildDniFilter = (
  value: string
): Prisma.StringFilter<"Patient"> | string =>
  value.length === 8 ? value : { startsWith: value };

const buildPatientSearchWhere = ({
  dni,
  firstname,
  lastname,
}: PatientSearchFilters): Prisma.PatientWhereInput => {
  const dniTerm = normalizeSearch(dni);
  const firstnameTerm = normalizeSearch(firstname);
  const lastnameTerm = normalizeSearch(lastname);

  if (dniTerm) {
    return {
      dni: buildDniFilter(dniTerm),
    };
  }

  return {
    ...(firstnameTerm && {
      firstName: {
        contains: firstnameTerm,
        mode: "insensitive",
      },
    }),
    ...(lastnameTerm && {
      lastName: {
        contains: lastnameTerm,
        mode: "insensitive",
      },
    }),
  };
};

export const getAllPatientsPaginatedService = async ({
  dni,
  firstname,
  lastname,
  page,
  take,
}: GetAllPatientsPaginatedInput) => {
  const whereClause = buildPatientSearchWhere({ dni, firstname, lastname });

  const patientsDB = await prisma.patient.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      district: { select: { name: true } },
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
export const getAllPatientsByPsychologistIdService = async ({
  params,
  query,
}: GetPatientsByPsychologistIdInput) => {
  const { page, take } = query;
  const { dni, firstname, lastname } = query;
  const { psychologistId } = params;

  const whereClause: Prisma.PatientWhereInput = {
    psychologistId,
    ...buildPatientSearchWhere({ dni, firstname, lastname }),
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

export const getAllPatientsSearchService = async ({
  dni,
  firstname,
  lastname,
}: GetAllPatientsSearchInput) => {
  const whereClause = buildPatientSearchWhere({ dni, firstname, lastname });

  if (Object.keys(whereClause).length === 0) {
    return [];
  }

  const patientsDB = await prisma.patient.findMany({
    where: whereClause,
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
  const { page, take } = query;
  const { dni, firstname, lastname } = query;
  const { psychologistId } = params;

  const whereClause: Prisma.PatientWhereInput = {
    appointments: {
      some: {
        userId: psychologistId,
      },
    },
    ...buildPatientSearchWhere({ dni, firstname, lastname }),
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
