import nodemailer from "nodemailer";
import { env } from "../../common/config";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.gmailUser,
    pass: env.gmailPass,
  },
});
