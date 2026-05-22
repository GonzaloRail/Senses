import express from "express";
import { 
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument, 
} from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { 
  getAllDocumentsSchema,
  getDocumentByIdSchema,
  createDocumentSchema,
  updateDocumentSchema, 
} from "./schema";

const DOCUMENT_ROUTES = {
  GET_ALL: "/documents",
  GET_BY_ID: "/documents/:id",
  CREATE: "/documents",
  UPDATE: "/documents/:id",
};

const router = express.Router();

router.get(
  DOCUMENT_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllDocumentsSchema),
  getAllDocuments
);

router.get(
  DOCUMENT_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getDocumentByIdSchema),
  getDocumentById
);

router.post(
  DOCUMENT_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createDocumentSchema),
  createDocument
);

router.put(
  DOCUMENT_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateDocumentSchema),
  updateDocument
);

export default router;
