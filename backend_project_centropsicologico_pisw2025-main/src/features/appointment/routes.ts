import express from "express";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  createAppointmentSchema,
  getAllAppointmentsPaginatedSchema,
  getAppointmentByIdSchema,
  getAppointmentsByDateSchema,
  getAppointmentsByEntityIdSchema,
  getAppointmentsListSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./schema";
import {
  createAppointment,
  getAllAppointmentsPaginated,
  getAllAppointmentsPaginatedByDate,
  getAppointmentById,
  getAppointmentsByOfficeId,
  getAppointmentsByPatientId,
  getAppointmentsByPsychologistId,
  getAppointmentsList,
  updateAppointment,
  updateAppointmentStatus,
} from "./controller";

const APPOINMENT_ROUTES = {
  GET_ALL: "/appointments",
  GET_ALL_BY_DATE: "/appointments/by_date",
  GET_BY_ID: "/appointments/:id",
  CREATE: "/appointments",
  UPDATE: "/appointments/:id",
  GET_BY_PATIENT_ID: "/appointments/patient/:id",
  GET_BY_PSYCHOLOGIST_ID: "/appointments/psychologist/:id",
  GET_BY_OFFICE_ID: "/appointments/office/:id",
  UPDATE_STATUS: "/appointments/status/:id",
  GET_APPOINTMENTS_LIST: "/appointments/list/:id",
};

const router = express.Router();

router.get(
  APPOINMENT_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllAppointmentsPaginatedSchema),
  getAllAppointmentsPaginated
);

router.get(
  APPOINMENT_ROUTES.GET_ALL_BY_DATE,
  authenticateJWT,
  validateSchema(getAllAppointmentsPaginatedSchema),
  getAllAppointmentsPaginatedByDate
);

router.get(
  APPOINMENT_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getAppointmentByIdSchema),
  getAppointmentById
);

router.post(
  APPOINMENT_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createAppointmentSchema),
  createAppointment
);

router.put(
  APPOINMENT_ROUTES.UPDATE_STATUS,
  authenticateJWT,
  validateSchema(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

router.put(
  APPOINMENT_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateAppointmentSchema),
  updateAppointment
);

router.get(
  APPOINMENT_ROUTES.GET_BY_PATIENT_ID,
  authenticateJWT,
  validateSchema(getAppointmentsByEntityIdSchema),
  getAppointmentsByPatientId
);

router.get(
  APPOINMENT_ROUTES.GET_BY_OFFICE_ID,
  authenticateJWT,
  validateSchema(getAppointmentsByEntityIdSchema),
  getAppointmentsByOfficeId
);
router.get(
  APPOINMENT_ROUTES.GET_BY_PSYCHOLOGIST_ID,
  authenticateJWT,
  validateSchema(getAppointmentsByEntityIdSchema),
  getAppointmentsByPsychologistId
);

router.get(
  APPOINMENT_ROUTES.GET_APPOINTMENTS_LIST,
  authenticateJWT,
  validateSchema(getAppointmentsByDateSchema),
  getAppointmentsList
);

export default router;
