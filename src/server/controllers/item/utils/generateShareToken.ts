import { randomBytes } from "crypto"

export const generateShareToken = () => {
    const SIZE = 40
    return randomBytes(SIZE).toString("hex")
}
