import express from "express";
import { getAllRoles } from "./controller";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";

const ROLES_ROUTES = {
  GET_ALL: "/roles",
};

const router = express.Router();

router.get(ROLES_ROUTES.GET_ALL, authenticateJWT, getAllRoles);

export default router;
