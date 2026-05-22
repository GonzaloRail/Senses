import express from "express";
import {
  getAllOfficesPaginated,
  getOfficeById,
  updateOffice,
  createOffice,
  getAvailableOfficesByDateAndName,
  getAllOfficesSearch,
} from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  getAllOfficesPaginatedSchema,
  getOfficeByIdSchema,
  updateOfficeSchema,
  createOfficeSchema,
  getAvailableOfficesByDateAndNameSchema,
  getAllOfficesSearchSchema,
} from "./schema";

const OFFICE_ROUTES = {
  GET_ALL: "/offices",
  SEARCH: "/offices/search",
  SEARCH_ALL: "/offices/search-all",
  GET_BY_ID: "/offices/:id",
  UPDATE: "/offices/:id",
  CREATE: "/offices",
};

const router = express.Router();

router.get(
  OFFICE_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllOfficesPaginatedSchema),
  getAllOfficesPaginated
);

router.get(
  OFFICE_ROUTES.SEARCH,
  authenticateJWT,
  validateSchema(getAvailableOfficesByDateAndNameSchema),
  getAvailableOfficesByDateAndName
);

router.get(
  OFFICE_ROUTES.SEARCH_ALL,
  authenticateJWT,
  validateSchema(getAllOfficesSearchSchema),
  getAllOfficesSearch
);

router.get(
  OFFICE_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getOfficeByIdSchema),
  getOfficeById
);

router.put(
  OFFICE_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateOfficeSchema),
  updateOffice
);

router.post(
  OFFICE_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createOfficeSchema),
  createOffice
);

export default router;
