import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import {
  GetFormSubmissionByIdInput,
  GetFormSubmissionByPatientTestIdInput,
  CreateFormSubmissionInput,
  UpdateFormSubmissionInput,
} from "./schema";

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getFormSubmissionByIdService = async ({
  id,
}: GetFormSubmissionByIdInput) => {
  const submission = await prisma.formSubmission.findUnique({
    where: { id },
    include: {
      formTemplate: {
        select: { id: true, name: true, fieldsSchema: true },
      },
      completedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      patientTest: {
        select: {
          id: true,
          testId: true,
          clinicalHistoryId: true,
        },
      },
    },
  });

  if (!submission) {
    throw new AppError("Respuesta de formulario no encontrada", 404);
  }

  return submission;
};

// ─── GET BY PATIENT TEST ID ───────────────────────────────────────────────────

export const getFormSubmissionByPatientTestIdService = async ({
  patientTestId,
}: GetFormSubmissionByPatientTestIdInput) => {
  const submission = await prisma.formSubmission.findUnique({
    where: { patientTestId },
    include: {
      formTemplate: {
        select: { id: true, name: true, fieldsSchema: true },
      },
      completedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  if (!submission) {
    throw new AppError(
      "No se encontró una respuesta de formulario para este PatientTest",
      404
    );
  }

  return submission;
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createFormSubmissionService = async (
  data: CreateFormSubmissionInput
) => {
  const { formTemplateId, responseData, completedById, patientTestId } = data;

  // Verificar que la plantilla exista y esté activa
  const template = await prisma.formTemplate.findUnique({
    where: { id: formTemplateId },
  });
  if (!template) {
    throw new AppError("Plantilla de formulario no encontrada", 404);
  }
  if (!template.isActive) {
    throw new AppError("La plantilla de formulario está inactiva", 400);
  }

  // Si se pasa patientTestId, verificar que exista y no tenga ya una submission
  if (patientTestId) {
    const patientTest = await prisma.patientTest.findUnique({
      where: { id: patientTestId },
      include: { formSubmission: true },
    });

    if (!patientTest) {
      throw new AppError("PatientTest no encontrado", 404);
    }

    if (patientTest.formSubmission) {
      throw new AppError(
        "Este PatientTest ya tiene una respuesta de formulario. Actualiza la existente.",
        409
      );
    }
  }

  const submission = await prisma.$transaction(async (tx) => {
    // Crear la submission
    const created = await tx.formSubmission.create({
      data: {
        formTemplate: { connect: { id: formTemplateId } },
        responseData: responseData as any,
        completedBy: { connect: { id: completedById } },
        ...(patientTestId && {
          patientTest: { connect: { id: patientTestId } },
        }),
      },
      include: {
        formTemplate: {
          select: { id: true, name: true, fieldsSchema: true },
        },
        completedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Actualizar el submissionMode del PatientTest a FORM
    if (patientTestId) {
      await tx.patientTest.update({
        where: { id: patientTestId },
        data: { submissionMode: "FORM" },
      });
    }

    return created;
  });

  return submission;
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateFormSubmissionService = async (
  data: UpdateFormSubmissionInput
) => {
  const { id } = data.params;
  const { responseData, patientTestId } = data.body;

  const existing = await prisma.formSubmission.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Respuesta de formulario no encontrada", 404);
  }

  const dataToUpdate: any = {};

  if (responseData !== undefined) {
    dataToUpdate.responseData = responseData;
  }

  if (patientTestId !== undefined) {
    // Verificar que el PatientTest no esté ya tomado por otra submission
    const conflict = await prisma.formSubmission.findFirst({
      where: { patientTestId, id: { not: id } },
    });
    if (conflict) {
      throw new AppError(
        "El PatientTest especificado ya tiene otra respuesta de formulario",
        409
      );
    }
    dataToUpdate.patientTest = { connect: { id: patientTestId } };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedSubmission = await tx.formSubmission.update({
      where: { id },
      data: dataToUpdate,
      include: {
        formTemplate: {
          select: { id: true, name: true, fieldsSchema: true },
        },
        completedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Si se vinculó a un PatientTest, asegurar que su modo quede en FORM
    if (patientTestId) {
      await tx.patientTest.update({
        where: { id: patientTestId },
        data: { submissionMode: "FORM" },
      });
    }

    return updatedSubmission;
  });

  return updated;
};
