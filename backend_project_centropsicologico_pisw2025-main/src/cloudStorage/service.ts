import { Storage } from "@google-cloud/storage";
import { GenerateUrlInput, GetUrlInput } from "./schema";
import prisma from "../lib/prisma";
import { AppError } from "../common/utils";
import { env } from "../common/config";

const BUCKET_NAME = env.BUCKET_NAME;

export const generateUrlService = async (data: GenerateUrlInput) => {
  const storage = new Storage();
  const bucket = storage.bucket(BUCKET_NAME);
  const { fileName, fileType, dni } = data;
  const sanitizedFileName = fileName.replace(/\s+/g, "-");

  const filePath = `users/${dni}/uploads/${Date.now()}-${sanitizedFileName}`;
  const file = bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 5 * 60 * 1000, // 5 min
    contentType: fileType,
  });

  return { uploadUrl: url, filePath };
};

export const getUrlToDownloadService = async ({ fileId }: GetUrlInput) => {
  const fileDB = await prisma.document.findUnique({
    where: { id: fileId },
  });

  if (!fileDB || !fileDB.filePath) {
    throw new AppError("File not found in DataBase", 404);
  }
  const storage = new Storage();
  const bucket = storage.bucket(BUCKET_NAME);

  const file = bucket.file(fileDB.filePath);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 60 * 1000, // 60 min
  });

  return { downloadUrl: url };
};
