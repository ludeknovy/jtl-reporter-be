import { shouldSkipLabel } from "./labelFilter"

describe("shouldSkipLabel", () => {
    it("should return false when there is no settings", () => {
        const result = shouldSkipLabel("my label", null)
        expect(result).toBe(false)
    })
    it("should return false when there is empty settings", () => {
        const result = shouldSkipLabel("my label", [])
        expect(result).toBe(false)
    })
    it("should return false when there is no match", () => {
        const result = shouldSkipLabel("my label", [
            { labelTerm: "test", operator: "includes" },
            { labelTerm: "test 1", operator: "match" }])
        expect(result).toBe(false)
    })
    it("should return true when there is partial match", () => {
        const result = shouldSkipLabel("test label", [
            { labelTerm: "test", operator: "includes" },
            { labelTerm: "another label", operator: "match" }])
        expect(result).toBe(true)
    })
    it("should return true when there is exact match", () => {
        const result = shouldSkipLabel("test label", [
            { labelTerm: "my label", operator: "includes" },
            { labelTerm: "test label", operator: "match" }])
        expect(result).toBe(true)
    })
})
