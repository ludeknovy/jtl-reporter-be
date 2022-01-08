import { chartQueryOptionInterval } from "./duration"

describe("chartQueryOptionInterval", () => {
  it("should return interval correct interval", () => {
    const interval = chartQueryOptionInterval(10)
    expect(interval).toEqual(3000)
  })
})
