import express from "express";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  getAllClinicalHistoriesSchema,
  getClinicalHistoryByIdSchema,
  getClinicalHistoryByPatientIdSchema,
} from "./schema";
import {
  getAllClinicalHistories,
  getClinicalHistoryById,
  getClinicalHistoryByPatientId,
} from "./controller";

const CLINICAL_HISTORY_ROUTES = {
  GET_BY_PATIENT_ID: "/clinical-histories/patient/:patientId", // It's not used, in case of use it you must change document url if needed
  GET_ALL: "/clinical-histories",
  GET_BY_ID: "/clinical-histories/:id",
};

const router = express.Router();

router.get(
  CLINICAL_HISTORY_ROUTES.GET_BY_PATIENT_ID,
  authenticateJWT,
  validateSchema(getClinicalHistoryByPatientIdSchema),
  getClinicalHistoryByPatientId
);

router.get(
  CLINICAL_HISTORY_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllClinicalHistoriesSchema),
  getAllClinicalHistories
);

router.get(
  CLINICAL_HISTORY_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getClinicalHistoryByIdSchema),
  getClinicalHistoryById
);

export default router;
