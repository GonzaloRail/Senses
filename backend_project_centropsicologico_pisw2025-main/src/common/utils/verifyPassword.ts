import bcrypt from "bcrypt";

export const verifyPassword = async (
  inputPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(inputPassword, storedPassword);
};
