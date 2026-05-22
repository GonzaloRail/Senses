import express from "express";
import {
  createPatient,
  downloadPatientReport,
  getAllPatientsPaginated,
  getAllPatientsSearch,
  getMyPatientList,
  getPatientByAppointmentId,
  getPatientById,
  getPatientsByPsychologistId,
  updatePatient,
} from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  createPatientSchema,
  getAllPatientsPaginatedSchema,
  getAllPatientsSearchSchema,
  getMyPatientListSchema,
  getPatientByAppointmentIdSchema,
  getPatientByIdSchema,
  getPatientsByPsychologistIdSchema,
  updatePatientSchema,
} from "./schema";

const PATIENT_ROUTES = {
  SEARCH: "/patients/search",
  GET_ALL: "/patients",
  GET_BY_ID: "/patients/:id",
  GET_BY_APPOINTMENT_ID: "/patients/appointment/:appointmentId",
  CREATE: "/patients",
  UPDATE: "/patients/:id",
  GET_BY_PSYCHOLOGIST_ID: "/patients/psychologist/:psychologistId",
  GET_MY_PATIENT_LIST: "/patients/list/:psychologistId",
  DOWNLOAD_REPORT: "/patients/download-report",
};

const router = express.Router();

router.get(
  PATIENT_ROUTES.DOWNLOAD_REPORT,
  authenticateJWT,
  downloadPatientReport
)
router.get(
  PATIENT_ROUTES.GET_BY_PSYCHOLOGIST_ID,
  authenticateJWT,
  validateSchema(getPatientsByPsychologistIdSchema),
  getPatientsByPsychologistId
);
router.get(
  PATIENT_ROUTES.SEARCH,
  authenticateJWT,
  validateSchema(getAllPatientsSearchSchema),
  getAllPatientsSearch
);
router.get(
  PATIENT_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllPatientsPaginatedSchema),
  getAllPatientsPaginated
);
router.get(
  PATIENT_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getPatientByIdSchema),
  getPatientById
);
router.get(
  PATIENT_ROUTES.GET_BY_APPOINTMENT_ID,
  authenticateJWT,
  validateSchema(getPatientByAppointmentIdSchema),
  getPatientByAppointmentId
);
router.post(
  PATIENT_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createPatientSchema),
  createPatient
);
router.put(
  PATIENT_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updatePatientSchema),
  updatePatient
);

router.get(
  PATIENT_ROUTES.GET_MY_PATIENT_LIST,
  authenticateJWT,
  validateSchema(getMyPatientListSchema),
  getMyPatientList
);

export default router;
