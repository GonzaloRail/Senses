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

import fs from "fs";
import path from "path";

export const localUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).send("Path parameter is required");
      return;
    }

    const fullDir = path.join(process.cwd(), "uploads", path.dirname(filePath));
    fs.mkdirSync(fullDir, { recursive: true });

    const fullPath = path.join(process.cwd(), "uploads", filePath);
    fs.writeFileSync(fullPath, req.body);

    res.status(200).send("File uploaded locally");
  } catch (error) {
    next(error);
  }
};
