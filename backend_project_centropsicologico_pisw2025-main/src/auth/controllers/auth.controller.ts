import { Request, Response, NextFunction } from "express";
import {
  activateAccountService,
  loginUserService,
  refreshTokenService,
  requestPasswordResetService,
  resetPasswordService,
  selectRoleAndLocationService,
  validateActivationTokenService,
  validateResetTokenService,
} from "../service/auth.service";
import { AppError } from "../../common/utils";

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken, ...result } = await loginUserService(req.body);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, //change in production (true)
        sameSite: "none", // "none" in production
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
      .status(200)
      .json(result);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("refreshToken",{
      httpOnly: true,
      secure: true,
      sameSite: "none",
    }).sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken ?? "";
    console.log("refreshToken", refreshToken);
    const { newToken, roleSelected, user } = await refreshTokenService(
      refreshToken
    );
    console.log("roleSelectedrefresh", roleSelected);
    res.status(200).json({ accessToken: newToken, roleSelected, user });
  } catch (error) {
    next(error);
  }
};

export const selectRoleAndLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roleId } = req.body;
    const refreshToken = req.cookies.refreshToken;
    console.log("roleIds", roleId);
    const {
      accessToken,
      refreshToken: newRefreshToken,
      roleSelected,
    } = await selectRoleAndLocationService(refreshToken, roleId);
    console.log("role selected", roleSelected);
    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true, // true en producción
        sameSite: "none", // "none" en producción con HTTPS
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      })
      .status(200)
      .json({ accessToken, roleSelected });
  } catch (error) {
    next(error);
  }
};

export const validateActivationToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new AppError("Token no proporcionado", 400);
    }

    const result = await validateActivationTokenService(token);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const activateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;

    // Validación de contraseña
    if (!password || password.length < 6) {
      throw new AppError("La contraseña debe tener al menos 6 caracteres", 400);
    }

    const result = await activateAccountService(token, password);

    res.json({
      success: true,
      message: "Cuenta activada exitosamente",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email es requerido", 400);
    }

    const result = await requestPasswordResetService(
      email,
      req.ip,
      req.get("user-agent")
    );
    console.log(result);
    // Siempre devolver el mismo mensaje por seguridad
    res.json({
      success: true,
      message:
        "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.",
      ...(process.env.NODE_ENV === "development" && result),
    });
  } catch (error) {
    next(error);
  }
};

export const validateResetToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new AppError("Token no proporcionado", 400);
    }

    const result = await validateResetTokenService(token);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError("Token y contraseña son requeridos", 400);
    }

    // Validación de contraseña
    if (password.length < 6) {
      throw new AppError("La contraseña debe tener al menos 6 caracteres", 400);
    }

    await resetPasswordService(token, password);

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};
