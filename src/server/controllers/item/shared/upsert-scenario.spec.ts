import { db } from "../../../../db/db"
import { upsertScenario } from "./upsert-scenario"

jest.mock("../../../../db/db")

describe("upsertScenario", () => {

    beforeEach(() => {
        jest.resetAllMocks()
    })
    it("should create scenario if it does not exist and allowed by settings", async () => {
        (db.one as any).mockResolvedValueOnce({ upsertScenario: true });
        (db.oneOrNone as any).mockResolvedValueOnce(null)
        const spy = jest.spyOn(require("../../../queries/scenario"), "createNewScenario")
        await upsertScenario("projectName", "scenarioNAme")
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith("projectName", "scenarioNAme")
    })
    it("should not create scenario if it already exists and allowed by settings", async () => {
        (db.one as any).mockResolvedValueOnce({ upsertScenario: true });
        (db.oneOrNone as any).mockResolvedValueOnce("scenarioName")
        const spy = jest.spyOn(require("../../../queries/scenario"), "createNewScenario")
        await upsertScenario("projectName", "scenarioNAme")
        expect(spy).toHaveBeenCalledTimes(0)
    })
    it("should not create scenario if not allowed by settings", async () => {
        (db.one as any).mockResolvedValueOnce({ upsertScenario: false })
        const spy = jest.spyOn(require("../../../queries/scenario"), "createNewScenario")
        await upsertScenario("projectName", "scenarioNAme")
        expect(spy).toHaveBeenCalledTimes(0)

    })
})
