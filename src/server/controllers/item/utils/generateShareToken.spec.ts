import { generateShareToken } from "./generateShareToken"

describe("generateShareToken", () => {
    it("should generate token", () => {
        const token = generateShareToken()
        expect(token).toBeDefined()
    })
})
