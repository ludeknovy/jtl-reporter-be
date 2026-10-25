import * as fs from "fs"
import * as path from "path"
import { EventEmitter } from "events"
import { db } from "../../../../db/db"
import { logger } from "../../../../logger"
import { transformMonitoringDataForDb } from "../../../data-stats/prepare-data"
import { processMonitoringCsv } from "./process-monitoring-csv"
import { UPLOAD_DIRECTORY } from "./uploaded-file-path"

jest.mock("fs")
jest.mock("fast-csv", () => ({ parse: jest.fn(() => ({})) }))
jest.mock("pg-promise", () => jest.fn(() => ({
    helpers: {
        ColumnSet: jest.fn(),
        TableName: jest.fn(),
        insert: jest.fn(() => "INSERT"),
    },
})))
jest.mock("../../../../db/db")
jest.mock("../../../../logger")
jest.mock("../../../data-stats/prepare-data")

const validFilename = path.join(UPLOAD_DIRECTORY, "monitoring-id")

const mockMonitoringStream = (): EventEmitter => {
    const csvStream = new EventEmitter()
    Object.assign(csvStream, { pause: jest.fn(), resume: jest.fn() })
    ;(fs.createReadStream as jest.Mock).mockReturnValue({ pipe: jest.fn(() => csvStream) })
    return csvStream
}

describe("processMonitoringCsv uploaded file paths", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(fs.createReadStream as jest.Mock).mockReset()
        ;(db.none as jest.Mock).mockReset().mockResolvedValue(undefined)
        ;(transformMonitoringDataForDb as jest.Mock).mockReset().mockReturnValue({
            timestamp: "2026-01-01", cpu: 10, mem: 20, name: "server", itemId: "new-item",
        })
    })

    it.each([
        undefined,
        "",
        path.resolve(UPLOAD_DIRECTORY, "..", "secrets.txt"),
        path.resolve(UPLOAD_DIRECTORY, "..", "uploads-other", "monitor.csv"),
    ])("does not read, write, or unlink an invalid path: %s", filename => {
        processMonitoringCsv(filename as string, "new-item")

        expect(fs.createReadStream).not.toHaveBeenCalled()
        expect(db.none).not.toHaveBeenCalled()
        expect(fs.unlinkSync).not.toHaveBeenCalled()
    })

    it("reads and deletes a monitoring upload inside the allowed directory", async () => {
        const csvStream = mockMonitoringStream()
        processMonitoringCsv(validFilename, "new-item")

        expect(fs.createReadStream).toHaveBeenCalledWith(validFilename)

        csvStream.emit("data", { cpu: "10" })
        csvStream.emit("end", 1)
        await new Promise<void>(resolve => setImmediate(resolve))

        expect(db.none).toHaveBeenCalledTimes(1)
        expect(fs.unlinkSync).toHaveBeenCalledTimes(1)
        expect(fs.unlinkSync).toHaveBeenCalledWith(validFilename)
    })

    it("does not delete the file if persisting monitoring data fails", async () => {
        const csvStream = mockMonitoringStream()
        ;(db.none as jest.Mock).mockRejectedValue(new Error("database unavailable"))
        processMonitoringCsv(validFilename, "new-item")

        csvStream.emit("data", { cpu: "10" })
        csvStream.emit("end", 1)
        await new Promise<void>(resolve => setImmediate(resolve))

        expect(fs.unlinkSync).not.toHaveBeenCalled()
        expect(logger.error).toHaveBeenCalled()
    })
})
