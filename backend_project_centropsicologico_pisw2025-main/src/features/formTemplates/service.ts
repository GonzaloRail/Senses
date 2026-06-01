import { AppError } from "../../common/utils";
import prisma from "../../lib/prisma";
import { randomUUID } from "crypto";
import {
  GetAllFormTemplatesInput,
  GetFormTemplateByIdInput,
  GetFormTemplateByTestIdInput,
  CreateFormTemplateInput,
  UpdateFormTemplateInput,
  FormField,
} from "./schema";

/**
 * Garantiza que cada campo del formulario tenga un id único.
 * Si el campo no trae id (o está vacío), se genera un UUID automáticamente.
 */
const normalizeFields = (fields: FormField[]): FormField[] =>
  fields.map((field) => ({
    ...field,
    id: field.id?.trim() ? field.id : randomUUID(),
  }));

// ─── GET ALL (paginado, para admin) ──────────────────────────────────────────

export const getAllFormTemplatesService = async ({
  page = 1,
  take = 10,
  search = "",
  isActive,
}: GetAllFormTemplatesInput) => {
  const where: any = {};

  if (search.trim().length > 0) {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [formTemplates, totalCount] = await Promise.all([
    prisma.formTemplate.findMany({
      where,
      take,
      skip: (page - 1) * take,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        test: {
          select: { id: true, name: true },
        },
        _count: {
          select: { formSubmissions: true },
        },
      },
    }),
    prisma.formTemplate.count({ where }),
  ]);

  return {
    currentPage: page,
    totalPages: Math.ceil(totalCount / take),
    formTemplates,
  };
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getFormTemplateByIdService = async ({
  id,
}: GetFormTemplateByIdInput) => {
  const formTemplate = await prisma.formTemplate.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      test: {
        select: { id: true, name: true, description: true },
      },
    },
  });

  if (!formTemplate) {
    throw new AppError("Plantilla de formulario no encontrada", 404);
  }

  return formTemplate;
};

// ─── GET BY TEST ID ───────────────────────────────────────────────────────────
// Usado por el psicólogo para obtener el formulario asociado a un Test

export const getFormTemplateByTestIdService = async ({
  testId,
}: GetFormTemplateByTestIdInput) => {
  const formTemplate = await prisma.formTemplate.findFirst({
    where: { testId, isActive: true },
    include: {
      test: {
        select: { id: true, name: true },
      },
    },
  });

  if (!formTemplate) {
    // Si el test no tiene plantilla propia, intentamos devolver la plantilla por defecto
    const defaultTemplate = await prisma.formTemplate.findFirst({
      where: { isDefault: true, isActive: true },
    });

    if (!defaultTemplate) {
      throw new AppError(
        "No se encontró una plantilla de formulario para este test",
        404
      );
    }

    return defaultTemplate;
  }

  return formTemplate;
};

// ─── GET DEFAULTS (listado para psicólogos) ───────────────────────────────────

export const getDefaultFormTemplatesService = async () => {
  const templates = await prisma.formTemplate.findMany({
    where: { isActive: true, isDefault: true },
    orderBy: { createdAt: "desc" },
    include: {
      test: { select: { id: true, name: true } },
    },
  });

  return templates;
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createFormTemplateService = async (
  data: CreateFormTemplateInput
) => {
  const { createdById, testId, fieldsSchema, ...rest } = data;

  // Si se vincula a un Test, verificar que el Test exista y no tenga ya una plantilla
  if (testId) {
    const testExists = await prisma.test.findUnique({ where: { id: testId } });
    if (!testExists) {
      throw new AppError("El Test especificado no existe", 404);
    }

    const existingTemplate = await prisma.formTemplate.findUnique({
      where: { testId },
    });
    if (existingTemplate) {
      throw new AppError(
        "Este Test ya tiene una plantilla de formulario asociada. Actualiza la existente.",
        409
      );
    }
  }

  const formTemplate = await prisma.formTemplate.create({
    data: {
      ...rest,
      // Normalizar campos: asignar UUID a los que no tengan id
      fieldsSchema: normalizeFields(fieldsSchema) as any,
      createdBy: { connect: { id: createdById } },
      ...(testId && { test: { connect: { id: testId } } }),
    },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      test: {
        select: { id: true, name: true },
      },
    },
  });

  return formTemplate;
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateFormTemplateService = async (
  data: UpdateFormTemplateInput
) => {
  const { id } = data.params;
  const { testId, fieldsSchema, ...rest } = data.body;

  const existing = await prisma.formTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Plantilla de formulario no encontrada", 404);
  }

  // Si se quiere vincular a un nuevo Test, verificar que no haya conflicto
  if (testId !== undefined && testId !== null) {
    const testExists = await prisma.test.findUnique({ where: { id: testId } });
    if (!testExists) {
      throw new AppError("El Test especificado no existe", 404);
    }

    const conflict = await prisma.formTemplate.findFirst({
      where: { testId, id: { not: id } },
    });
    if (conflict) {
      throw new AppError(
        "El Test especificado ya tiene otra plantilla de formulario asociada",
        409
      );
    }
  }

  const dataToUpdate: any = { ...rest };

  if (fieldsSchema !== undefined) {
    // Normalizar campos: asignar UUID a los que no tengan id
    dataToUpdate.fieldsSchema = normalizeFields(fieldsSchema);
  }

  if (testId !== undefined) {
    dataToUpdate.test =
      testId === null
        ? { disconnect: true }
        : { connect: { id: testId } };
  }

  const updated = await prisma.formTemplate.update({
    where: { id },
    data: dataToUpdate,
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      test: {
        select: { id: true, name: true },
      },
    },
  });

  return updated;
};

// ─── SOFT DELETE (desactivar) ─────────────────────────────────────────────────

export const deleteFormTemplateService = async ({
  id,
}: GetFormTemplateByIdInput) => {
  const existing = await prisma.formTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Plantilla de formulario no encontrada", 404);
  }

  const deactivated = await prisma.formTemplate.update({
    where: { id },
    data: { isActive: false },
  });

  return deactivated;
};
