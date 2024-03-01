import { db } from "../../../../db/db"
import { itemErrorHandler } from "./item-error-handler"

jest.mock("../../../../db/db")

describe("itemErrorHandler", () => {

    beforeEach(() => {
        jest.resetAllMocks()
    })
    it("should try set the item to error state", () => {
        (db.none as any).mockResolvedValueOnce(null)
        const spy = jest.spyOn(require("../../../queries/items"), "updateItem")
        itemErrorHandler("item_id", Error("Test Error"))
        expect(spy).toHaveBeenCalledTimes(1)
    })
})
