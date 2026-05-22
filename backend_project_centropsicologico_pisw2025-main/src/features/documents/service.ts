import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import {
  GetAllDocumentsInput,
  GetDocumentByIdInput,
  CreateDocumentInput,
  UpdateDocumentInput,
} from "./schema";

export const getAllDocumentsService = async ({
  page,
  take,
  search,
}: GetAllDocumentsInput) => {
  const documentsDB = await prisma.document.findMany({
    take: take!,
    skip: (page! - 1) * take!,
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
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
        },
      },
    },
  });

  const totalDocuments = await prisma.document.count({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });

  const totalPages = Math.ceil(totalDocuments / take!);

  return {
    currentPage: page!,
    totalPages,
    documents: documentsDB,
  };
};

export const getDocumentByIdService = async ({ id }: GetDocumentByIdInput) => {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      test: {
        include: {
          evaluation: true,
        },
      },
      patientTest: {
        include: {
          completedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          test: {
            select: {
              name: true,
            },
          },
          clinicalHistory: {
            select: {
              displayInt: true,
            },
          },
        },
      },
      employeeLeave: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!document) {
    throw new AppError("Documento no encontrado", 404);
  }

  return document;
};

export const createDocumentService = async (data: CreateDocumentInput) => {
  const documentCreated = await prisma.$transaction(async (tx) => {
    const { userId, testId, patientTestId, employeeLeaveId, ...restData } =
      data;

    const document = await tx.document.create({
      data: {
        ...restData,
        user: userId ? { connect: { id: userId } } : undefined,
        test: testId ? { connect: { id: testId } } : undefined,
        patientTest: patientTestId
          ? { connect: { id: patientTestId } }
          : undefined,
        employeeLeave: employeeLeaveId
          ? { connect: { id: employeeLeaveId } }
          : undefined,
      },
    });

    return document;
  });

  if (!documentCreated) {
    throw new AppError("Error en la creación del documento", 500);
  }

  return documentCreated;
};

export const updateDocumentService = async (data: UpdateDocumentInput) => {
  const { id } = data.params;
  const { userId, testId, patientTestId, employeeLeaveId, ...restData } =
    data.body;

  const documentExists = await prisma.document.findUnique({
    where: { id },
  });

  if (!documentExists) {
    throw new AppError("Documento no encontrado", 404);
  }

  const dataToUpdate = {
    ...restData,
    ...(userId !== undefined && {
      ...(userId
        ? { user: { connect: { id: userId } } }
        : { user: { disconnect: true } }),
    }),
    ...(testId !== undefined && {
      ...(testId
        ? { test: { connect: { id: testId } } }
        : { test: { disconnect: true } }),
    }),
    ...(patientTestId !== undefined && {
      ...(patientTestId
        ? { patientTest: { connect: { id: patientTestId } } }
        : { patientTest: { disconnect: true } }),
    }),
    ...(employeeLeaveId !== undefined && {
      ...(employeeLeaveId
        ? { employeeLeave: { connect: { id: employeeLeaveId } } }
        : { employeeLeave: { disconnect: true } }),
    }),
  };

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: dataToUpdate,
  });

  return updatedDocument;
};
