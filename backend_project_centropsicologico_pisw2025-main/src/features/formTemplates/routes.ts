import express from "express";
import {
  getAllFormTemplates,
  getFormTemplateById,
  getFormTemplateByTestId,
  getDefaultFormTemplates,
  createFormTemplate,
  updateFormTemplate,
  deleteFormTemplate,
} from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  getAllFormTemplatesSchema,
  getFormTemplateByIdSchema,
  getFormTemplateByTestIdSchema,
  createFormTemplateSchema,
  updateFormTemplateSchema,
} from "./schema";

const FORM_TEMPLATE_ROUTES = {
  /** Admin: listado paginado de todas las plantillas */
  GET_ALL: "/form-templates",
  /** Psicólogo/Admin: plantillas activas por defecto */
  GET_DEFAULTS: "/form-templates/defaults",
  /** Psicólogo: obtener plantilla vinculada a un Test */
  GET_BY_TEST_ID: "/form-templates/test/:testId",
  /** Admin: obtener plantilla por ID */
  GET_BY_ID: "/form-templates/:id",
  /** Admin: crear nueva plantilla */
  CREATE: "/form-templates",
  /** Admin: actualizar campos de una plantilla */
  UPDATE: "/form-templates/:id",
  /** Admin: soft-delete (desactivar) una plantilla */
  DELETE: "/form-templates/:id",
};

const router = express.Router();

// Rutas de lectura — accesibles para psicólogos y admin
router.get(
  FORM_TEMPLATE_ROUTES.GET_DEFAULTS,
  authenticateJWT,
  getDefaultFormTemplates
);

router.get(
  FORM_TEMPLATE_ROUTES.GET_BY_TEST_ID,
  authenticateJWT,
  validateSchema(getFormTemplateByTestIdSchema),
  getFormTemplateByTestId
);

router.get(
  FORM_TEMPLATE_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllFormTemplatesSchema),
  getAllFormTemplates
);

router.get(
  FORM_TEMPLATE_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getFormTemplateByIdSchema),
  getFormTemplateById
);

// Rutas de escritura — solo admin (la autorización por rol se puede agregar
// con un middleware checkRole(["ADMIN"]) cuando esté disponible)
router.post(
  FORM_TEMPLATE_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createFormTemplateSchema),
  createFormTemplate
);

router.put(
  FORM_TEMPLATE_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateFormTemplateSchema),
  updateFormTemplate
);

router.delete(
  FORM_TEMPLATE_ROUTES.DELETE,
  authenticateJWT,
  validateSchema(getFormTemplateByIdSchema),
  deleteFormTemplate
);

export default router;
export { FORM_TEMPLATE_ROUTES };
