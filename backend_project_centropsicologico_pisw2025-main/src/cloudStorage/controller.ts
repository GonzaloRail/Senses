import { NextFunction, Request, Response } from "express";
import { generateUrlService, getUrlToDownloadService } from "./service";

export const generateUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await generateUrlService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUrlToDownload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.params;
    const result = await getUrlToDownloadService({ fileId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
