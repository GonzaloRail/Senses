import express from "express";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  getConsentTypes,
  getIncomeRanges,
  getIntakeOptionGroups,
  getPatientIntakeCatalog,
} from "./controller";
import { intakeCatalogQuerySchema } from "./schema";

const PATIENT_INTAKE_CATALOG_ROUTES = {
  CATALOG: "/patient-intake/catalog",
  OPTION_GROUPS: "/patient-intake/option-groups",
  INCOME_RANGES: "/patient-intake/income-ranges",
  CONSENT_TYPES: "/patient-intake/consent-types",
};

const router = express.Router();

router.get(
  PATIENT_INTAKE_CATALOG_ROUTES.CATALOG,
  authenticateJWT,
  validateSchema(intakeCatalogQuerySchema),
  getPatientIntakeCatalog
);

router.get(
  PATIENT_INTAKE_CATALOG_ROUTES.OPTION_GROUPS,
  authenticateJWT,
  validateSchema(intakeCatalogQuerySchema),
  getIntakeOptionGroups
);

router.get(
  PATIENT_INTAKE_CATALOG_ROUTES.INCOME_RANGES,
  authenticateJWT,
  validateSchema(intakeCatalogQuerySchema),
  getIncomeRanges
);

router.get(
  PATIENT_INTAKE_CATALOG_ROUTES.CONSENT_TYPES,
  authenticateJWT,
  validateSchema(intakeCatalogQuerySchema),
  getConsentTypes
);

export default router;
