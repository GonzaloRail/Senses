import express from "express";
import {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  createTestsBatch,
  getTestsOptions
} from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  getAllTestsSchema,
  getTestByIdSchema,
  createTestSchema,
  updateTestSchema,
  createTestsBatchSchema,
  getTestsOptionsByEvaluationSchema
} from "./schema";

const TEST_ROUTES = {
  GET_ALL: "/tests",
  GET_BY_ID: "/tests/:id",
  CREATE: "/tests",
  UPDATE: "/tests/:id",
  CREATE_BATCH: "/tests/batch",
  GET_TESTS_OPTIONS_BY_EVALUATION: "/tests-options/:id",
};

const router = express.Router();

router.post(
  TEST_ROUTES.CREATE_BATCH,
  authenticateJWT,
  validateSchema(createTestsBatchSchema),
  createTestsBatch
);

router.get(
  TEST_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllTestsSchema),
  getAllTests
);

router.get(
  TEST_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getTestByIdSchema),
  getTestById
);

router.post(
  TEST_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createTestSchema),
  createTest
);

router.put(
  TEST_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateTestSchema),
  updateTest
);

router.get(
  TEST_ROUTES.GET_TESTS_OPTIONS_BY_EVALUATION,
  authenticateJWT,
  validateSchema(getTestsOptionsByEvaluationSchema),
  getTestsOptions
);

export default router;
export { TEST_ROUTES };