import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  getAvailablePsychologistsByDateAndName,
  getAllPsychologistSmall,
  getUsersByName,
  getPsychologistByName
} from "./controller";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  createUserSchema,
  getAllUsersPaginatedSchema,
  getAvailablePsychologistsByDateAndNameSchema,
  getPsychologistByNameSchema,
  getUserByIdSchema,
  getUsersByNameSchema,
  updateUserSchema,
} from "./schema";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { get } from "http";

const USER_ROUTES = {
  CREATE_USER: "/users",
  GET_USERS: "/users",
  GET_PSYCHOLOGYST_SMALL: "/users/all-psychologist",
  GET_USER_BY_ID: "/users/:id",
  UPDATE_USER: "/users/:id",
  DELETE_USER: "/users/:id",
  GET_USER_DOCUMENTS: "/users/:id/documents",
  GET_USER_ROLES: "/users/:id/roles",
  ADD_USER_ROLE: "/users/:id/roles",
  DELETE_USER_ROLE: "/users/:id/roles/:roleId",
  GET_AVAILABLE_PSYCHOLOGISTS: "/users/available-psychologist/search",
  GET_PSYCHOLOGIST: "/users/psychologist/search",
  GET_USERS_BY_SEARCH_QUERY: "/users/search",
};

const router = express.Router();

router.post(
  USER_ROUTES.CREATE_USER,
  authenticateJWT,
  validateSchema(createUserSchema),
  createUser
);
router.get(
  USER_ROUTES.GET_PSYCHOLOGYST_SMALL,
  authenticateJWT,
  validateSchema(getAllUsersPaginatedSchema),
  getAllPsychologistSmall
);

router.get(
  USER_ROUTES.GET_USERS_BY_SEARCH_QUERY,
  authenticateJWT,
  validateSchema(getUsersByNameSchema),
  getUsersByName
);

router.get(
  USER_ROUTES.GET_PSYCHOLOGIST,
  authenticateJWT,
  validateSchema(getPsychologistByNameSchema),
  getPsychologistByName
);

router.get(
  USER_ROUTES.GET_AVAILABLE_PSYCHOLOGISTS,
  authenticateJWT,
  validateSchema(getAvailablePsychologistsByDateAndNameSchema),
  getAvailablePsychologistsByDateAndName
);

router.get(
  USER_ROUTES.GET_USER_BY_ID,
  authenticateJWT,
  validateSchema(getUserByIdSchema),
  getUserById
);

router.get(
  USER_ROUTES.GET_USERS,
  authenticateJWT,
  validateSchema(getAllUsersPaginatedSchema),
  getAllUsers
);

router.put(
  USER_ROUTES.UPDATE_USER,
  authenticateJWT,
  validateSchema(updateUserSchema),
  updateUser
);

export default router;
