import express from "express";
import {
  createLocation,
  getAllLocations,
  getAllLocationsSearch,
  getLocationById,
  updateLocation,
} from "./controller";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  createLocationSchema,
  getAllLocationsSchema,
  getAllLocationsSearchSchema,
  getLocationByIdSchema,
  updateLocationSchema,
} from "./schema";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";

const LOCATION_ROUTES = {
  SEARCH: "/locations/search",
  GET_ALL: "/locations", // HC-204
  GET_BY_ID: "/locations/:id", // HC-211
  UPDATE: "/locations/:id", // HC-216
  CREATE: "/locations", // HC-205
};

const router = express.Router();

router.get(
  LOCATION_ROUTES.SEARCH,
  authenticateJWT,
  validateSchema(getAllLocationsSearchSchema),
  getAllLocationsSearch
);

router.get(
  LOCATION_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllLocationsSchema),
  getAllLocations
);

router.get(
  LOCATION_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getLocationByIdSchema),
  getLocationById
);

router.put(
  LOCATION_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateLocationSchema),
  updateLocation
);
router.post(
  LOCATION_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createLocationSchema),
  createLocation
);

export default router;
