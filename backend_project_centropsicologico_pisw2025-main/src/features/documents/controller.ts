import { NextFunction, Request, Response } from "express";
import { 
  getAllDocumentsService,
  getDocumentByIdService,
  createDocumentService,
  updateDocumentService, 
} from "./service";

export const getAllDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, take = 10, search = "" } = req.query;
    const queryParams = {
      page: Number(page),
      take: Number(take),
      search: String(search),
    };
    const result = await getAllDocumentsService(queryParams);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await getDocumentByIdService({ id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createDocumentService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: documentId } = req.params;
    const result = await updateDocumentService({
      params: { id: documentId },
      body: req.body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};