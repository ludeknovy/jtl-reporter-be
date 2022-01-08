import { roundNumberTwoDecimals, findMinMax } from "./stats-fc"

describe("Stats Helper", () => {
  describe("roundNumberTwoDecimals", () => {
    it.each([
      [0.1, 0.1],
      [100, 100],
      [0.12, 0.12],
      [3.123, 3.12]])("should correctly round %s", (input, expectedNumber) => {
      const roundedNumber = roundNumberTwoDecimals(input)
      expect(roundedNumber).toBe(expectedNumber)
    })
  })
  describe("findMinMax", () => {
    it("should correctly return min and max", () => {
      const testData = [-1, 3, 0, 2, -0.1, 1000, 1000.1, 12, 0.1]
      const { min, max } = findMinMax(testData)
      expect(min).toBe(-1)
      expect(max).toBe(1000.1)
    })
  })
})
