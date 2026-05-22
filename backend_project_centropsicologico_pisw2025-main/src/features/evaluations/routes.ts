import express from "express";
import {
  getAllEvaluationsPaginated,
  getAllEvaluationsListPaginated,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  updateEvaluationStatus,
  getEvaluationOptions,
  getSectionsOrders,
  updateEvaluationsSectionOrders,
  getAllEvaluationsByClinicalHistoryIdSortedBySection,
} from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  getAllEvaluationsPaginatedSchema,
  getEvaluationByIdSchema,
  createEvaluationSchema,
  updateEvaluationSchema,
  getAllEvaluationsListPaginatedSchema,
  updateEvaluationStatusSchema,
  updateEvaluationsSectionOrdersSchema,
  getAllEvaluationsByClinicalHistoryIdSortedBySectionSchema,
} from "./schema";

const EVALUATION_ROUTES = {
  GET_ALL: "/evaluations",
  GET_ALL_LIST: "/evaluations/list",
  GET_BY_ID: "/evaluations/:id",
  CREATE: "/evaluations",
  UPDATE: "/evaluations/:id",
  UPDATE_STATUS: "/evaluations/status/:id",
  GET_SECTIONS_ORDERS: "/evaluations/sections/orders",
  UPDATE_SECTIONS_ORDERS: "/evaluations/sections/orders",
  GET_ALL_BY_CLINICAL_HISTORY_ID_SORTED_BY_SECTION:
    "/evaluations/clinical-history/:id/sections/sorted",
  GET_EVALUATION_OPTIONS: "/evaluations-options",
};

const router = express.Router();

router.get(
  EVALUATION_ROUTES.GET_ALL_BY_CLINICAL_HISTORY_ID_SORTED_BY_SECTION,
  authenticateJWT,
  validateSchema(getAllEvaluationsByClinicalHistoryIdSortedBySectionSchema),
  getAllEvaluationsByClinicalHistoryIdSortedBySection
);
router.get(
  EVALUATION_ROUTES.GET_SECTIONS_ORDERS,
  authenticateJWT,
  getSectionsOrders
);

router.put(
  EVALUATION_ROUTES.UPDATE_SECTIONS_ORDERS,
  authenticateJWT,
  validateSchema(updateEvaluationsSectionOrdersSchema),
  updateEvaluationsSectionOrders
);

router.get(
  EVALUATION_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllEvaluationsPaginatedSchema),
  getAllEvaluationsPaginated
);

router.get(
  EVALUATION_ROUTES.GET_ALL_LIST,
  authenticateJWT,
  validateSchema(getAllEvaluationsListPaginatedSchema),
  getAllEvaluationsListPaginated
);

router.get(
  EVALUATION_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getEvaluationByIdSchema),
  getEvaluationById
);

router.post(
  EVALUATION_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createEvaluationSchema),
  createEvaluation
);

router.put(
  EVALUATION_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateEvaluationSchema),
  updateEvaluation
);

router.put(
  EVALUATION_ROUTES.UPDATE_STATUS,
  authenticateJWT,
  validateSchema(updateEvaluationStatusSchema),
  updateEvaluationStatus
);

router.get(
  EVALUATION_ROUTES.GET_EVALUATION_OPTIONS,
  authenticateJWT,
  getEvaluationOptions
);

export default router;
export { EVALUATION_ROUTES };
