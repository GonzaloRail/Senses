import express from "express";
import { getAllRegions, getRegionById } from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";

const REGION_ROUTES = {
  GET_ALL: "/regions",
  GET_BY_ID: "/regions/:id",
};

const router = express.Router();

router.get(REGION_ROUTES.GET_ALL, authenticateJWT, getAllRegions);
router.get(REGION_ROUTES.GET_BY_ID, authenticateJWT, getRegionById);

export default router;
