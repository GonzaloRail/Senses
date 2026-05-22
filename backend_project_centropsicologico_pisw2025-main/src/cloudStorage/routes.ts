import express from "express";
import { authenticateJWT } from "../auth/middlewares/auth.middleware";
import { validateSchema } from "../common/middlewares/validateSchema";
import { generateUrlSchema, getUrlSchema } from "./schema";
import { generateUrl, getUrlToDownload } from "./controller";

const STORAGE_ROUTES = {
  GENERATE_URL: "/files/upload-url",
  GET_URL: "/files/:fileId/download-url",
};

const router = express.Router();

router.post(
  STORAGE_ROUTES.GENERATE_URL,
  authenticateJWT,
  validateSchema(generateUrlSchema),
  generateUrl
);

router.get(
  STORAGE_ROUTES.GET_URL,
  authenticateJWT,
  validateSchema(getUrlSchema),
  getUrlToDownload
);

export default router;
