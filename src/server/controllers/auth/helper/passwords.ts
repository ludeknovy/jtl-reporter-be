import * as bcrypt from "bcrypt"
const SALT_ROUNDS = 10

export const passwordMatch = async (password, hashPassword): Promise<boolean> => {
  const match = await bcrypt.compare(password, hashPassword)
  return match
}

export const hashPassword = (password): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS)
}
