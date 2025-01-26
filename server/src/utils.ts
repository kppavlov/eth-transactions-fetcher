import bcrypt from "bcrypt";

const saltRounds = 10;

export const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err;
  }
};

export const verifyPassword = async (
  inputPassword: string,
  storedHash: string,
) => {
  try {
    return await bcrypt.compare(inputPassword, storedHash);
  } catch (err) {
    return Promise.reject(err);
  }
};
