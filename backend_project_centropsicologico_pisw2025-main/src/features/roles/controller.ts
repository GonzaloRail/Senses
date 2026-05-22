import { NextFunction, Request, Response } from "express";
import { getAllRolesService } from "./service";

export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await getAllRolesService();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};
