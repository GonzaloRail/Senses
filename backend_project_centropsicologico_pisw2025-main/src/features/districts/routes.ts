import express from "express";
import { getDistrictsByProvinceId } from "./controller";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { getDistrictsByProvinceIdSchema } from "./schema";

const DISTRICT_ROUTES = {
  GET_BY_PROVINCE_ID: "/districts/province/:id",
};

const router = express.Router();

router.get(
  DISTRICT_ROUTES.GET_BY_PROVINCE_ID,
  authenticateJWT,
  validateSchema(getDistrictsByProvinceIdSchema),
  getDistrictsByProvinceId
);

export default router;
