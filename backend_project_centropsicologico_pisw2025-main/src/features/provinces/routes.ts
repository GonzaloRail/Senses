import express from "express";
import { getProvinceById, getProvincesByRegionId } from "./controller";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { getProvincesByRegionIdSchema } from "./schema";

const PROVINCE_ROUTES = {
  GET_BY_REGION_ID: "/provinces/region/:id",
  GET_BY_ID: "/provinces/:id",
};

const router = express.Router();

router.get(
  PROVINCE_ROUTES.GET_BY_REGION_ID,
  authenticateJWT,
  validateSchema(getProvincesByRegionIdSchema),
  getProvincesByRegionId
);
router.get(PROVINCE_ROUTES.GET_BY_ID, authenticateJWT, getProvinceById);

export default router;
