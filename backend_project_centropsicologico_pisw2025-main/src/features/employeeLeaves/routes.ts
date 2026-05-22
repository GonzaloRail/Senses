import express from "express";
import { authenticateJWT } from "../../auth/middlewares/auth.middleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import {
  createEmployeeLeaveSchema,
  getAllEmployeeLeavesSchema,
  getEmployeeLeaveByIdSchema,
  getEmployeeLeavesByUserIdSchema,
  updateEmployeeLeaveSchema,
  updateEmployeeLeaveStatusSchema,
} from "./schema";
import {
  createEmployeeLeave,
  getAllEmployeeLeaves,
  getEmployeeLeaveById,
  getEmployeeLeavesByUserId,
  updateEmployeeLeave,
  updateEmployeeLeaveStatus,
} from "./controller";

const EMPLOYEE_LEAVE_ROUTES = {
  GET_ALL: "/employee-leaves",
  GET_BY_ID: "/employee-leaves/:id",
  CREATE: "/employee-leaves",
  UPDATE: "/employee-leaves/:id",
  GET_BY_USER_ID: "/employee-leaves/user/:id",
  UPDATE_STATUS: "/employee-leaves/status/:id",

};

const router = express.Router();

router.get(
  EMPLOYEE_LEAVE_ROUTES.GET_ALL,
  authenticateJWT,
  validateSchema(getAllEmployeeLeavesSchema),
  getAllEmployeeLeaves
);

router.get(
  EMPLOYEE_LEAVE_ROUTES.GET_BY_ID,
  authenticateJWT,
  validateSchema(getEmployeeLeaveByIdSchema),
  getEmployeeLeaveById
);

router.post(
  EMPLOYEE_LEAVE_ROUTES.CREATE,
  authenticateJWT,
  validateSchema(createEmployeeLeaveSchema),
  createEmployeeLeave
);

router.put(
  EMPLOYEE_LEAVE_ROUTES.UPDATE_STATUS,
  authenticateJWT,
  validateSchema(updateEmployeeLeaveStatusSchema),
  updateEmployeeLeaveStatus
);

router.put(
  EMPLOYEE_LEAVE_ROUTES.UPDATE,
  authenticateJWT,
  validateSchema(updateEmployeeLeaveSchema),
  updateEmployeeLeave
);

router.get(
  EMPLOYEE_LEAVE_ROUTES.GET_BY_USER_ID,
  authenticateJWT,
  validateSchema(getEmployeeLeavesByUserIdSchema),
  getEmployeeLeavesByUserId
);

export default router;
