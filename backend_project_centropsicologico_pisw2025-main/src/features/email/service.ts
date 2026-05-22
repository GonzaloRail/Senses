import { env } from "../../common/config";
import { transporter } from "./config";
import { EmailPayload } from "./types";

export async function sendEmail(payload: EmailPayload) {
  const { to, subject, text, html } = payload;

  const info = await transporter.sendMail({
    from: `"Sistema Historial Clínico - Senses Psicólogos" <${env.gmailUser}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}
