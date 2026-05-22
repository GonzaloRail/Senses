import "dotenv/config";

export const env = {
  gmailUser: process.env.GMAIL_USER!,
  gmailPass: process.env.GMAIL_PASS!,
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  BUCKET_NAME: process.env.BUCKET_NAME!,
};
