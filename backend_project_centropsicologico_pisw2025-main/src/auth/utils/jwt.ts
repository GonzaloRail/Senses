import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  roleId?: string;
}

const secretKey = process.env.JWT_SECRET_KEY as string;
const refreshSecretKey = process.env.JWT_REFRESH_KEY as string;

export const generateAccessToken = (userId: string, roleId?: string) => {
  return jwt.sign({ userId, roleId }, secretKey, {
    expiresIn: "1h",
    algorithm: "HS256",
  });
};

export const generateRefreshToken = (userId: string, roleId?: string) => {
  return jwt.sign({ userId, roleId }, refreshSecretKey, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

export const verifyToken = (
  token: string,
  type: "access" | "refresh" = "access"
) => {
  return jwt.verify(
    token,
    type === "access" ? secretKey : refreshSecretKey
  ) as JwtPayload;
};
