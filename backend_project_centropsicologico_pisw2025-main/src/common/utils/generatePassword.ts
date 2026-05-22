export const generateSecurePassword = (length: number = 8): string => {
  const characters: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()+-=[]{}<>?";
  const array: Uint32Array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (num) => characters[num % characters.length]).join(
    ""
  );
};
