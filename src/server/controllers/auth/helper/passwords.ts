import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

export const passwordMatch = async (password, hashPassword) => {
  const match = await bcrypt.compare(password, hashPassword);
  return match;
}

export const hashPassword = async (password) => {
  const hashPassword = await bcrypt.hash(password, SALT_ROUNDS)
  return hashPassword
}
