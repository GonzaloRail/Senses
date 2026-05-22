import { AppError } from "../../common/utils";
import { getUrlFileByFilePath } from "../../common/utils/getUrlFileByFilePath";
import prisma from "../../lib/prisma";
import {
  GetAllTestsInput,
  GetTestByIdInput,
  CreateTestInput,
  UpdateTestInput,
  CreateTestsBatchInput,
  GetTestsOptionsByEvaluationInput,
} from "./schema";

export const getAllTestsService = async ({
  page,
  take,
  search,
}: GetAllTestsInput) => {
  const testsDB = await prisma.test.findMany({
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
      evaluation: { select: { name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  const totalPages = Math.ceil(
    (await prisma.test.count({
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
    tests: testsDB,
  };
};

export const getTestByIdService = async ({ id }: GetTestByIdInput) => {
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      evaluation: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      patientTests: {
        select: {
          id: true,
          completedAt: true,
          isGeneralDoc: true,
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
                },
              },
            },
          },
        },
      },
    },
  });

  if (!test) {
    throw new AppError("Prueba no encontrada", 404);
  }

  return test;
};

export const createTestService = async (data: CreateTestInput) => {
  const testCreated = await prisma.test.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true, // true por defecto si no se envía
      createdBy: {
        connect: { id: data.createdById },
      },
      evaluation: {
        connect: { id: data.evaluationId },
      },
    },
  });

  if (!testCreated) {
    throw new AppError("Error creando la prueba", 404);
  }

  return testCreated;
};

export const updateTestService = async (data: UpdateTestInput) => {
  const { id } = data.params;
  const { createdById, evaluationId, ...restData } = data.body;

  const testExists = await prisma.test.findUnique({
    where: { id },
  });

  if (!testExists) {
    throw new AppError("Prueba no encontrada", 404);
  }

  const dataToUpdate = {
    ...restData,
    ...(createdById && {
      createdBy: {
        connect: { id: createdById },
      },
    }),
    ...(evaluationId && {
      evaluation: {
        connect: { id: evaluationId },
      },
    }),
  };

  const updatedTest = await prisma.test.update({
    where: { id },
    data: dataToUpdate,
    include: {
      evaluation: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return updatedTest;
};

export const createTestsBatchService = async (data: CreateTestsBatchInput) => {
  const { testsToCreate } = data;

  const result = await prisma.$transaction(async (tx) => {
    const createdTests = [];

    for (const testData of testsToCreate) {
      const test = await tx.test.create({
        data: {
          name: testData.name,
          description: testData.description,
          isActive: true,
          createdBy: {
            connect: { id: testData.createdById },
          },
          evaluation: {
            connect: { id: testData.evaluationId },
          },
          document: {
            create: {
              name: testData.filename,
              type: "TEMPLATE",
              filePath: testData.filePath,
              user: {
                connect: { id: testData.createdById },
              },
            },
          },
        },
      });

      createdTests.push(test);
    }

    return createdTests;
  });

  return {
    success: true,
    count: result.length,
    tests: result,
    evaluationId: testsToCreate[0].evaluationId,
  };
};

export const getTestsOptionsByEvaluationService = async ({
  id,
}: GetTestsOptionsByEvaluationInput) => {
  const tests = await prisma.test.findMany({
    where: {
      evaluationId: id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      document: {
        select: {
          fileUrl: true,
          filePath: true,
        },
      },
    },
  });

  const testsToReturn = await Promise.all(
    tests.map(async (test) => {
      if (!test.document?.filePath) {
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
  );

  return testsToReturn;
};
