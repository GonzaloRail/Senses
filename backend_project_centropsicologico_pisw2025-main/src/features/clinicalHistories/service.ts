import { start } from "repl";
import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import {
  GetAllClinicalHistoriesInput,
  GetClinicalHistoryByIdInput,
  GetClinicalHistoryByPatientIdInput,
} from "./schema";

export const getClinicalHistoryByPatientIdService = async ({
  patientId,
}: GetClinicalHistoryByPatientIdInput) => {
  const patientWithHistory = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      clinicalHistory: {
        include: {
          patientTests: {
            include: {
              completedBy: {
                omit: {
                  password: true,
                },
              },
              document: true,
              test: {
                include: {
                  evaluation: true,
                },
              },
            },
          },
          patient: {
            include: {
              psychologist: {
                omit: {
                  password: true,
                },
              },
              district: {
                include: {
                  province: {
                    include: {
                      region: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!patientWithHistory) {
    throw new AppError("Paciente no encontrado", 404);
  }

  if (!patientWithHistory.clinicalHistory) {
    throw new AppError("Historia clínica del paciente no encontrado", 404);
  }

  return patientWithHistory.clinicalHistory;
};

export const getAllClinicalHistoriesService = async ({
  page,
  take,
  search,
}: GetAllClinicalHistoriesInput) => {
  const q = typeof search === "string" ? search.trim() : "";

  const where: any = {};
  if (q.length > 0) {
    where.patient = {
      dni: {
        contains: q,
        mode: "insensitive",
      },
    };
  }
  const clinicalHistoriesDB = await prisma.clinicalHistory.findMany({
    where,
    take: take!,
    skip: (page! - 1) * take!,
    include: {
      patient: {
        include: {
          psychologist: true,
          district: {
            include: {
              province: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const totalCount = await prisma.clinicalHistory.count({ where });

  const totalPages = Math.ceil(totalCount / take!);

  return {
    currentPage: page!,
    totalPages,
    clinicalHistories: clinicalHistoriesDB,
  };
};

export const getClinicalHistoryByIdService = async ({
  id,
}: GetClinicalHistoryByIdInput) => {
  const clinicalHistory = await prisma.clinicalHistory.findUnique({
    where: { id },
    include: {
      patientTests: {
        include: {
          completedBy: {
            omit: {
              password: true,
            },
          },
          test: {
            include: {
              evaluation: true,
            },
          },
        },
      },
      patient: {
        include: {
          psychologist: {
            omit: {
              password: true,
            },
          },
          district: {
            include: {
              province: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!clinicalHistory) {
    throw new AppError("Historia clínica no encontrada", 404);
  }

  return clinicalHistory;
};
