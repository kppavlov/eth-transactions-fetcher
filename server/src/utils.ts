import bcrypt from "bcrypt";

const saltRounds = 10;

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  inputPassword: string,
  storedHash: string,
) => {
  return await bcrypt.compare(inputPassword, storedHash);
};
