import { env } from "../config";
import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = env.BUCKET_NAME;

export const getUrlFileByFilePath = async (filePath: string) => {
  const storage = new Storage();
  const bucket = storage.bucket(BUCKET_NAME);

  const file = bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 60 * 1000, // 60 min
  });

  return url;
};
