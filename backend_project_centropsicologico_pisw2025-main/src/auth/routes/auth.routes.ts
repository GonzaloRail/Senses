import express from "express";
import {
  activateAccount,
  loginUser,
  logoutUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  selectRoleAndLocation,
  validateActivationToken,
  validateResetToken,
} from "../controllers/auth.controller";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { loginUserSchema } from "../validators/auth.validator";

const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  LOGOUT: "/logout",
  REFRESH_TOKEN: "/refresh-token",
  SELECT_ROLE: "/select-role-location",
  VALIDATE_ACTIVATION: "/validate-activation/:token",
  ACTIVATE_ACCOUNT: "/activate-account",
  REQUEST_PASSWORD_RESET: "/request-password-reset",
  VALIDATE_RESET_TOKEN: "/validate-reset-token/:token",
  RESET_PASSWORD: "/reset-password",
};

const router = express.Router();

router.post(AUTH_ROUTES.LOGIN, validateSchema(loginUserSchema), loginUser);
router.post(AUTH_ROUTES.LOGOUT, logoutUser);

router.post(AUTH_ROUTES.REFRESH_TOKEN, refreshToken);
router.post(AUTH_ROUTES.SELECT_ROLE, selectRoleAndLocation);

router.get(AUTH_ROUTES.VALIDATE_ACTIVATION, validateActivationToken);
router.post(AUTH_ROUTES.ACTIVATE_ACCOUNT, activateAccount);

router.post(AUTH_ROUTES.REQUEST_PASSWORD_RESET, requestPasswordReset);
router.get(AUTH_ROUTES.VALIDATE_RESET_TOKEN, validateResetToken);
router.post(AUTH_ROUTES.RESET_PASSWORD, resetPassword);

export default router;
