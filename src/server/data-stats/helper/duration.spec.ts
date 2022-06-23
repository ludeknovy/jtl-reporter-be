import { chartQueryOptionInterval } from "./duration"


describe("chartQueryOptionInterval", () => {
  it("should return interval correct interval", () => {
    const DURATION = 10
    const EXPECTED_INTERVAL = 3000

    const interval = chartQueryOptionInterval(DURATION)
    expect(interval).toEqual(EXPECTED_INTERVAL)
  })
  it("should never return zero, but rather to default to 10ms", () => {
    const DURATION = 0
    const EXPECTED_INTERVAL = 10

    const interval = chartQueryOptionInterval(DURATION)
    expect(interval).toEqual(EXPECTED_INTERVAL)
  })
})
