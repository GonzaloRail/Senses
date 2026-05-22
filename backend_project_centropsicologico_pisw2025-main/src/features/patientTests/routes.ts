import express from "express";
import {
  getAllPatientTestsPaginated,
  getPatientTestById,
  createPatientTest,
  updatePatientTest,
  getPatientTestsByAppointmentId,
} from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  getAllPatientTestsPaginatedSchema,
  getPatientTestByIdSchema,
  createPatientTestSchema,
  updatePatientTestSchema,
  getPatientTestsByAppointmentIdSchema,
} from "./schema";

const PATIENT_TEST_ROUTES = {
  GET_ALL: "/patientTests",
  GET_BY_ID: "/patientTests/:id",
  CREATE: "/patientTests",
  UPDATE: "/patientTests/:id",
  GET_PATIENTTESTS_BY_APPOINTMENT_ID: "/patientTests/appointment/:appointmentId",
};

const router = express.Router();

router.get(
  PATIENT_TEST_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllPatientTestsPaginatedSchema),
  getAllPatientTestsPaginated
);

router.get(
  PATIENT_TEST_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getPatientTestByIdSchema),
  getPatientTestById
);

router.post(
  PATIENT_TEST_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createPatientTestSchema),
  createPatientTest
);

router.put(
  PATIENT_TEST_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updatePatientTestSchema),
  updatePatientTest
);

router.get(
  PATIENT_TEST_ROUTES.GET_PATIENTTESTS_BY_APPOINTMENT_ID,
  authenticateJWT,
  validateSchema(getPatientTestsByAppointmentIdSchema),
  getPatientTestsByAppointmentId
);

export default router;
export { PATIENT_TEST_ROUTES };