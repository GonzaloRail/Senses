import express from "express";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { 
  getAllItemInstancesSchema,
  getItemInstanceByIdSchema,
  createItemInstanceSchema,
  updateItemInstanceSchema, 
} from "./schema";
import { 
  getAllItemInstances,
  getItemInstanceById,
  createItemInstance,
  updateItemInstance, 
} from "./controller";

const ITEM_INSTANCE_ROUTES = {
  GET_ALL: "/item-instances",
  GET_BY_ID: "/item-instances/:id",
  CREATE: "/item-instances",
  UPDATE: "/item-instances/:id",
};

const router = express.Router();

router.get(
  ITEM_INSTANCE_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllItemInstancesSchema),
  getAllItemInstances
);

router.get(
  ITEM_INSTANCE_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getItemInstanceByIdSchema),
  getItemInstanceById
);

router.post(
  ITEM_INSTANCE_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createItemInstanceSchema),
  createItemInstance
);

router.put(
  ITEM_INSTANCE_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateItemInstanceSchema),
  updateItemInstance
);

export default router;
