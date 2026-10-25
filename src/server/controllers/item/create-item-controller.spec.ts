import * as fs from "fs"
import * as path from "path"
import { EventEmitter } from "events"
import { Response } from "express"
import { db } from "../../../db/db"
import { transformDataForDb } from "../../data-stats/prepare-data"
import { createItemController } from "./create-item-controller"
import { upsertScenario } from "./shared/upsert-scenario"
import { processMonitoringCsv } from "./utils/process-monitoring-csv"
import { UPLOAD_DIRECTORY } from "./utils/uploaded-file-path"

jest.mock("multer", () => jest.fn(() => ({
    fields: () => (_req: unknown, _res: unknown, done: (error?: Error) => void) => done(),
})))
jest.mock("fs")
jest.mock("fast-csv", () => ({ parse: jest.fn(() => ({})) }))
jest.mock("pg-promise", () => jest.fn(() => ({
    helpers: {
        ColumnSet: jest.fn(),
        TableName: jest.fn(),
        insert: jest.fn(() => "INSERT"),
    },
})))
jest.mock("../../../db/db")
jest.mock("../../../logger")
jest.mock("../../utils/analytics/anyltics-event")
jest.mock("../../data-stats/prepare-data")
jest.mock("./shared/upsert-scenario")
jest.mock("./shared/item-processing-queue")
jest.mock("./shared/item-data-processing")
jest.mock("./shared/item-error-handler")
jest.mock("./utils/process-monitoring-csv")

const validKpiPath = path.join(UPLOAD_DIRECTORY, "kpi-id")
const validMonitoringPath = path.join(UPLOAD_DIRECTORY, "monitor-id")

const makeRequest = (kpiPath?: string, monitoringPath?: string) => ({
    body: { environment: "test" },
    params: { projectName: "project", scenarioName: "scenario" },
    user: { userId: "user" },
    files: {
        kpi: [{ path: kpiPath }],
        ...(monitoringPath ? { monitoring: [{ path: monitoringPath }] } : {}),
    },
})

const makeResponse = (): Response => {
    const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    }
    return response as unknown as Response
}

const mockKpiStream = (): EventEmitter => {
    const csvStream = new EventEmitter()
    Object.assign(csvStream, { pause: jest.fn(), resume: jest.fn(), destroy: jest.fn() })
    ;(fs.createReadStream as jest.Mock).mockReturnValue({ pipe: jest.fn(() => csvStream) })
    return csvStream
}

const startValidUpload = async (monitoringPath?: string) => {
    const response = makeResponse()
    const next = jest.fn()

    await new Promise<void>(resolve => {
        (response.json as jest.Mock).mockImplementation(() => {
            resolve()
            return response
        })
        createItemController(makeRequest(validKpiPath, monitoringPath) as any, response, next)
    })

    return { response, next }
}

describe("createItemController uploaded file paths", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(db.one as jest.Mock).mockReset()
            .mockResolvedValueOnce({ id: "new-item" })
            .mockResolvedValueOnce({ generate_share_token: false, label_filter_settings: [] })
        ;(db.none as jest.Mock).mockReset().mockResolvedValue(undefined)
        ;(upsertScenario as jest.Mock).mockReset().mockResolvedValue(true)
        ;(fs.createReadStream as jest.Mock).mockReset()
    })

    it.each([
        ["KPI path outside uploads", path.resolve(UPLOAD_DIRECTORY, "..", "secret"), undefined],
        ["monitoring path outside uploads", validKpiPath, path.resolve(UPLOAD_DIRECTORY, "..", "secret")],
        ["missing KPI path", undefined, undefined],
    ])("rejects %s before writing to the database", (_description, kpiPath, monitoringPath) => {
        const response = makeResponse()
        const next = jest.fn()

        createItemController(makeRequest(kpiPath, monitoringPath) as any, response, next)

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            output: expect.objectContaining({ statusCode: 400 }),
        }))
        expect(upsertScenario).not.toHaveBeenCalled()
        expect(db.one).not.toHaveBeenCalled()
        expect(fs.createReadStream).not.toHaveBeenCalled()
        expect(processMonitoringCsv).not.toHaveBeenCalled()
        expect(response.status).not.toHaveBeenCalled()
    })

    it.each([
        ["without monitoring", undefined],
        ["with monitoring", validMonitoringPath],
    ])("processes a valid KPI upload %s", async (_description, monitoringPath) => {
        mockKpiStream()

        const { response, next } = await startValidUpload(monitoringPath)

        expect(next).not.toHaveBeenCalled()
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({ itemId: "new-item", shareToken: undefined })
        expect(fs.createReadStream).toHaveBeenCalledWith(validKpiPath)
        expect(processMonitoringCsv).toHaveBeenCalledWith(monitoringPath, "new-item")
    })

    it("deletes only the validated KPI file after successful processing", async () => {
        const csvStream = mockKpiStream()
        ;(transformDataForDb as jest.Mock).mockReturnValue({ itemId: "new-item" })

        await startValidUpload(validMonitoringPath)
        csvStream.emit("data", { label: "sample" })
        csvStream.emit("end", 1)
        await new Promise<void>(resolve => setImmediate(resolve))

        expect(fs.unlinkSync).toHaveBeenCalledTimes(1)
        expect(fs.unlinkSync).toHaveBeenCalledWith(validKpiPath)
    })
})
