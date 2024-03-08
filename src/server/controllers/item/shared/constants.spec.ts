import { ALLOWED_PERIOD } from "./constants"

describe("ALLOWED_PERIOD", () => {
    it("contains expected values", () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(ALLOWED_PERIOD).toEqual( [7, 14, 30, 90, 180] )
    })
})
