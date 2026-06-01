import express from "express";
import {
  getFormSubmissionById,
  getFormSubmissionByPatientTestId,
  createFormSubmission,
  updateFormSubmission,
} from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  getFormSubmissionByIdSchema,
  getFormSubmissionByPatientTestIdSchema,
  createFormSubmissionSchema,
  updateFormSubmissionSchema,
} from "./schema";

const FORM_SUBMISSION_ROUTES = {
  /** Obtener respuesta por PatientTest */
  GET_BY_PATIENT_TEST_ID: "/form-submissions/patient-test/:patientTestId",
  /** Obtener respuesta por ID */
  GET_BY_ID: "/form-submissions/:id",
  /** Crear nueva respuesta */
  CREATE: "/form-submissions",
  /** Actualizar respuesta existente */
  UPDATE: "/form-submissions/:id",
};

const router = express.Router();

router.get(
  FORM_SUBMISSION_ROUTES.GET_BY_PATIENT_TEST_ID,
  authenticateJWT,
  validateSchema(getFormSubmissionByPatientTestIdSchema),
  getFormSubmissionByPatientTestId
);

router.get(
  FORM_SUBMISSION_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getFormSubmissionByIdSchema),
  getFormSubmissionById
);

router.post(
  FORM_SUBMISSION_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createFormSubmissionSchema),
  createFormSubmission
);

router.put(
  FORM_SUBMISSION_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateFormSubmissionSchema),
  updateFormSubmission
);

export default router;
export { FORM_SUBMISSION_ROUTES };
