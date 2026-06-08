import { AppError } from "../../common/utils";
import { getUrlFileByFilePath } from "../../common/utils/getUrlFileByFilePath";
import prisma from "../../lib/prisma";
import {
  GetAllPatientTestsPaginatedInput,
  GetPatientTestByIdInput,
  CreatePatientTestInput,
  UpdatePatientTestInput,
  GetPatientTestsByAppointmentIdInput,
} from "./schema";

export const getAllPatientTestsPaginatedService = async ({
  page,
  search,
  take,
}: GetAllPatientTestsPaginatedInput) => {
  const patientTestsDB = await prisma.patientTest.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      test: {
        name: {
          startsWith: search,
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
    include: {
      test: {
        select: {
          id: true,
          name: true,
        },
      },
      completedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      clinicalHistory: {
        select: {
          id: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.patientTest.count({
      where: {
        test: {
          name: {
            startsWith: search,
          },
        },
      },
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    patientTests: patientTestsDB,
  };
};

export const getPatientTestByIdService = async ({
  id,
}: GetPatientTestByIdInput) => {
  const patientTest = await prisma.patientTest.findUnique({
    where: { id },
    include: {
      test: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      completedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      clinicalHistory: {
        select: {
          id: true,
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dni: true,
            },
          },
        },
      },
      document: {
        select: {
          id: true,
          name: true,
          fileUrl: true,
          type: true,
        },
      },
      // Respuesta de formulario dinámico (si submissionMode = FORM)
      formSubmission: {
        include: {
          formTemplate: {
            select: { id: true, name: true, fieldsSchema: true },
          },
        },
      },
    },
  });

  if (!patientTest) {
    throw new AppError("Prueba del paciente no encontrada", 404);
  }

  return patientTest;
};

export const createPatientTestService = async (
  data: CreatePatientTestInput
) => {
  const patientTest = await prisma.patientTest.create({
    data: {
      test: {
        connect: { id: data.testId },
      },
      clinicalHistory: {
        connect: { id: data.clinicalHistoryId },
      },
      completedBy: {
        connect: { id: data.completedById },
      },
      isGeneralDoc: data.isGeneralDoc ?? false,
      submissionMode: data.submissionMode ?? "DOCUMENT",
      ...(data.documentId && {
        document: {
          connect: { id: data.documentId },
        },
      }),
      appointment: data.appointmentId
        ? {
            connect: { id: data.appointmentId },
          }
        : undefined,
    },
    include: {
      test: {
        select: {
          id: true,
          name: true,
        },
      },
      completedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      clinicalHistory: {
        select: {
          id: true,
        },
      },
      document: {
        select: {
          id: true,
          name: true,
          fileUrl: true,
          type: true,
        },
      },
      appointment: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!patientTest) {
    throw new AppError("Error creando la prueba del paciente", 404);
  }

  return patientTest;
};

export const updatePatientTestService = async (
  data: UpdatePatientTestInput
) => {
  const { id } = data.params;
  const { documentId, ...restData } = data.body;

  const patientTestExists = await prisma.patientTest.findUnique({
    where: { id },
  });

  if (!patientTestExists) {
    throw new AppError("Prueba del paciente no encontrada", 404);
  }

  const dataToUpdate = {
    ...restData,
    ...(documentId !== undefined && {
      ...(documentId
        ? { document: { connect: { id: documentId } } }
        : { document: { disconnect: true } }),
    }),
  };

  const updatedPatientTest = await prisma.patientTest.update({
    where: { id },
    data: dataToUpdate,
    include: {
      test: {
        select: {
          id: true,
          name: true,
        },
      },
      completedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      clinicalHistory: {
        select: {
          id: true,
        },
      },
      document: {
        select: {
          id: true,
          name: true,
          fileUrl: true,
        },
      },
    },
  });

  return updatedPatientTest;
};

export const getPatientTestsByAppointmentIdService = async ({
  appointmentId,
}: GetPatientTestsByAppointmentIdInput) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patientTests: {
        include: {
          test: {
            include: {
              evaluation: true,
              document: true,
              formTemplate: {
                select: {
                  id: true,
                  name: true,
                  fieldsSchema: true,
                },
              },
            },
          },
          document: true,
          formSubmission: {
            select: {
              id: true,
              responseData: true,
            },
          },
        },
      },
    },
  });

  if (!appointment) {
    throw new AppError("Cita no encontrada", 404);
  }

  // Agrupar por evaluación
  const evaluationsMap = new Map<string, any>();

  await Promise.all(
    appointment.patientTests.map(async (patientTest) => {
      const evaluation = patientTest.test.evaluation;

      if (!evaluationsMap.has(evaluation.id)) {
        evaluationsMap.set(evaluation.id, {
          id: evaluation.id,
          name: evaluation.name,
          tests: [],
        });
      }

      // URLs (si existen)
      const templateUrl = patientTest.test.document?.filePath
        ? await getUrlFileByFilePath(patientTest.test.document.filePath)
        : patientTest.test.document?.fileUrl;

      const uploadedFileUrl = patientTest.document?.filePath
        ? await getUrlFileByFilePath(patientTest.document.filePath)
        : patientTest.document?.fileUrl;

      evaluationsMap.get(evaluation.id).tests.push({
        id: patientTest.id,
        testId: patientTest.testId,
        name: patientTest.test.name,
        submissionMode: patientTest.submissionMode,
        documentId: patientTest.document?.id,
        templateUrl,
        uploadedFileName: patientTest.document?.name,
        uploadedFileUrl,
        formTemplate: patientTest.test.formTemplate ?? null,
        formSubmission: patientTest.formSubmission ?? null,
      });
    })
  );

  const evaluations = Array.from(evaluationsMap.values());

  return evaluations;
};
