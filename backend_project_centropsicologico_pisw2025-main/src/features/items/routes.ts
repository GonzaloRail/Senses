import express from "express";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { 
  getAllItemsPaginatedSchema,
  getItemByIdSchema,
  createItemSchema,
  updateItemSchema,
  getAllItemsSearchSchema, 
} from "./schema";
import { 
  getAllItemsPaginated,
  getItemById,
  createItem,
  updateItem,
  getAllItemsSearch, 
} from "./controller";

const ITEM_ROUTES = {
  SEARCH: "/items/search",
  GET_ALL: "/items",
  GET_BY_ID: "/items/:id",
  CREATE: "/items",
  UPDATE: "/items/:id",
};

const router = express.Router();

router.get(
  ITEM_ROUTES.SEARCH,
  authenticateJWT,
  validateSchema(getAllItemsSearchSchema),
  getAllItemsSearch
);

router.get(
  ITEM_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllItemsPaginatedSchema),
  getAllItemsPaginated
);

router.get(
  ITEM_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getItemByIdSchema),
  getItemById
);

router.post(
  ITEM_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createItemSchema),
  createItem
);

router.put(
  ITEM_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateItemSchema),
  updateItem
);

export default router;