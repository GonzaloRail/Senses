import { Prisma, Test } from "@prisma/client";
import { AppError } from "../../common/utils";
import { organizeEvaluationsIntoSections } from "../../common/utils/EvaluationUtils";
import { getUrlFileByFilePath } from "../../common/utils/getUrlFileByFilePath";
import { SectionToDoSort } from "../../interfaces";
import { EvaluationDefaultID, Section } from "../../interfaces/Evaluation";
import prisma from "../../lib/prisma";
import {
  GetAllEvaluationsPaginatedInput,
  GetEvaluationByIdInput,
  CreateEvaluationInput,
  UpdateEvaluationInput,
  GetAllEvaluationsListPaginatedInput,
  UpdateEvaluationStatusInput,
  UpdateEvaluationsSectionOrdersInput,
  GetAllEvaluationsByClinicalHistoryIdSortedBySectionInput,
} from "./schema";

export const getAllEvaluationsPaginatedService = async ({
  page,
  search,
  take,
}: GetAllEvaluationsPaginatedInput) => {
  const evaluationsDB = await prisma.evaluation.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      name: {
        startsWith: search,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.evaluation.count({
      where: {
        name: {
          startsWith: search,
        },
      },
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    evaluations: evaluationsDB,
  };
};

export const getAllEvaluationsListPaginatedService = async ({
  page,
  search,
  take,
}: GetAllEvaluationsListPaginatedInput) => {
  const evaluationsDB = await prisma.evaluation.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      name: {
        startsWith: search,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      _count: {
        select: { tests: { where: { isActive: true } } },
      },
    },
  });

  const evaluations = evaluationsDB.map((evaluation) => ({
    id: evaluation.id,
    name: evaluation.name,
    isActive: evaluation.isActive,
    testCount: evaluation._count.tests,
  }));

  const totalPages = Math.ceil(
    (await prisma.evaluation.count({
      where: {
        name: {
          startsWith: search,
        },
      },
    })) / take!
  );

  return {
    currentPage: page!,
    totalPages,
    evaluations: evaluations,
  };
};

export const getEvaluationByIdService = async ({
  id,
}: GetEvaluationByIdInput) => {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      tests: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          document: true,
          formTemplate: {
            select: {
              id: true,
              name: true,
              description: true,
              fieldsSchema: true,
              isActive: true,
              isDefault: true,
            },
          },
        },
      },
    },
  });

  if (!evaluation) {
    throw new AppError("Evaluación no encontrada", 404);
  }

  const evaluationToReturn = {
    ...evaluation,
    tests: await Promise.all(
      evaluation.tests.map(async (test) => {
        if (!test.document?.filePath) {
          console.warn("Test does not have a filePath");
          return test;
        }

        const fileUrl = await getUrlFileByFilePath(test.document.filePath);

        return {
          ...test,
          document: {
            ...test.document,
            fileUrl,
          },
        };
      })
    ),
  };

  return evaluationToReturn;
};

export const createEvaluationService = async (data: CreateEvaluationInput) => {
  // Determinar el sectionOrder según el tipo de sección
  let sectionOrder: number;

  if (data.openNewSection) {
    // Si es una sección nueva, obtener el siguiente order disponible
    sectionOrder = await getNextCustomSectionOrder();
  } else {
    // Si va a la sección default, usar el order de las demás default
    sectionOrder = await getDefaultSectionOrder();
  }

  const evaluation = await prisma.evaluation.create({
    data: {
      name: data.name,
      description: data.description,
      openNewSection: data.openNewSection,
      sectionOrder: sectionOrder,
      createdBy: {
        connect: { id: data.createdById },
      },
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!evaluation) {
    throw new AppError("Error creando la evaluación", 404);
  }

  return evaluation;
};

export const updateEvaluationService = async (data: UpdateEvaluationInput) => {
  const { id } = data.params;
  const { ...restData } = data.body;

  const evaluationExists = await prisma.evaluation.findUnique({
    where: { id },
  });

  if (!evaluationExists) {
    throw new AppError("Evaluación no encontrada", 404);
  }

  const updatedEvaluation = await prisma.evaluation.update({
    where: { id },
    data: restData,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return updatedEvaluation;
};

export const updateEvaluationStatusService = async (
  data: UpdateEvaluationStatusInput
) => {
  const { id } = data.params;
  const { isActive } = data.body;

  const evaluationUpdated = await prisma.evaluation.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
  });

  return evaluationUpdated;
};

export const getSectionsOrdersService = async () => {
  const evaluations = await prisma.evaluation.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      openNewSection: true,
      sectionOrder: true,
      tests: {
        select: {
          patientTests: {
            select: {
              id: true, // we retrieve just the id to count them
            },
          },
        },
      },
    },
    orderBy: [{ sectionOrder: "asc" }, { name: "asc" }],
  });

  const defaultEvals = evaluations.filter((e) => !e.openNewSection);
  const customEvals = evaluations.filter((e) => e.openNewSection);

  const sections: SectionToDoSort[] = [];

  // Sección por defecto
  if (defaultEvals.length > 0) {
    sections.push({
      id: EvaluationDefaultID.DEFAULT_ID,
      name: "Evaluaciones",
      order: defaultEvals[0].sectionOrder,
      isDefault: true,
      evaluationCount: defaultEvals.length,
    });
  }

  // Secciones personalizadas
  customEvals.forEach((evaluation) => {
    sections.push({
      id: evaluation.id,
      name: evaluation.name,
      order: evaluation.sectionOrder,
      isDefault: false,
      evaluationCount: evaluation.tests?.length ?? 0,
    });
  });

  // Ordenar por order
  sections.sort((a, b) => a.order - b.order);
  return sections;
};

export const updateEvaluationsSectionOrdersService = async (
  data: UpdateEvaluationsSectionOrdersInput
) => {
  const { evaluations } = data;
  await prisma.$transaction(async (tx) => {
    for (const section of evaluations) {
      if (section.id === EvaluationDefaultID.DEFAULT_ID) {
        // Actualizar todas las evaluaciones con openNewSection = false
        await tx.evaluation.updateMany({
          where: { openNewSection: false },
          data: { sectionOrder: section.sectionOrder },
        });
      } else {
        // Actualizar solo esta evaluación
        await tx.evaluation.update({
          where: { id: section.id },
          data: { sectionOrder: section.sectionOrder },
        });
      }
    }
  });
};

export const getAllEvaluationsByClinicalHistoryIdSortedBySectionService =
  async ({ id }: GetAllEvaluationsByClinicalHistoryIdSortedBySectionInput) => {
    const evaluations = await prisma.evaluation.findMany({
      where: {
        tests: {
          some: {
            patientTests: {
              some: {
                clinicalHistoryId: id,
              },
            },
          },
        },
      },
      include: {
        tests: {
          where: {
            patientTests: {
              some: {
                clinicalHistoryId: id,
              },
            },
          },
          select: {
            id: true,
            name: true,
            document: true,
            formTemplate: {
              select: {
                id: true,
                name: true,
                fieldsSchema: true,
              },
            },
            patientTests: {
              where: {
                clinicalHistoryId: id,
              },
              orderBy: {
                completedAt: "desc",
              },
              select: {
                id: true,
                submissionMode: true,
                completedAt: true,
                completedBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                appointment: {
                  select: {
                    id: true,
                    startDate: true,
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
        },
      },
    });

    const evaluationsToReturn = await Promise.all(
      evaluations.map(async (evaluation) => {
        return {
          ...evaluation,
          tests: await Promise.all(
            evaluation.tests.map(async (test) => {
              // Obtener URL del documento del test template (si existe)
              let testDocumentWithUrl = test.document;
              if (test.document?.filePath) {
                const fileUrl = await getUrlFileByFilePath(
                  test.document.filePath
                );
                testDocumentWithUrl = {
                  ...test.document,
                  fileUrl,
                };
              }

              // Obtener URLs de los documentos de los patientTests
              const patientTestsWithUrls = await Promise.all(
                test.patientTests.map(async (patientTest) => {
                  if (!patientTest.document?.filePath) {
                    console.warn(
                      `PatientTest ${patientTest.id} does not have a filePath`
                    );
                    return patientTest;
                  }

                  const fileUrl = await getUrlFileByFilePath(
                    patientTest.document.filePath
                  );

                  return {
                    ...patientTest,
                    document: {
                      ...patientTest.document,
                      fileUrl,
                    },
                  };
                })
              );

              return {
                ...test,
                document: testDocumentWithUrl,
                patientTests: patientTestsWithUrls,
              };
            })
          ),
        };
      })
    );

    const sections: Section[] =
      organizeEvaluationsIntoSections(evaluationsToReturn);

    return sections;
  };

/**
 * Obtiene el sectionOrder actual de la sección default
 * Si no existe ninguna evaluación default, retorna 0
 */
async function getDefaultSectionOrder(): Promise<number> {
  const defaultEvaluation = await prisma.evaluation.findFirst({
    where: {
      openNewSection: false,
      isActive: true,
    },
    select: { sectionOrder: true },
  });

  return defaultEvaluation?.sectionOrder ?? 0;
}

/**
 * Obtiene el siguiente sectionOrder disponible para una nueva sección personalizada
 * Retorna el máximo order actual + 1
 */
async function getNextCustomSectionOrder(): Promise<number> {
  // Buscar el order más alto entre TODAS las evaluaciones (tanto default como custom)
  const maxOrderEvaluation = await prisma.evaluation.findFirst({
    where: { isActive: true },
    orderBy: { sectionOrder: "desc" },
    select: { sectionOrder: true },
  });

  return (maxOrderEvaluation?.sectionOrder ?? -1) + 1;
}

export const getEvaluationOptionsService = async () => {
  const evaluations = await prisma.evaluation.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return evaluations;
};
