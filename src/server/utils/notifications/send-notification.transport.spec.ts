import * as http from "http"
import { db } from "../../../db/db"
import { Overview } from "../../data-stats/prepare-data"
import { sendReportNotifications } from "./send-notification"

jest.mock("../../../db/db")

const OVERVIEW: Overview = {
    avgConnect: 1,
    avgLatency: 1,
    avgResponseTime: 1,
    bytesPerSecond: 20123,
    bytesSentPerSecond: 1233,
    duration: 1,
    endDate: new Date(),
    errorCount: 0,
    errorRate: 0,
    maxVu: 10,
    percentile90: 10,
    percentile95: 14,
    percentile99: 18,
    startDate: new Date(),
    throughput: 10,
}

const startWebhookServer = async () => {
    let resolveRequest: (request: { body: string; headers: http.IncomingHttpHeaders }) => void
    const receivedRequest = new Promise<{ body: string; headers: http.IncomingHttpHeaders }>(resolve => {
        resolveRequest = resolve
    })
    const server = http.createServer((request, response) => {
        const chunks = []
        request.on("data", chunk => chunks.push(Buffer.from(chunk)))
        request.on("end", () => {
            response.statusCode = 204
            response.end()
            resolveRequest({ body: Buffer.concat(chunks).toString(), headers: request.headers })
        })
    })

    await new Promise<void>((resolve, reject) => {
        server.once("error", reject)
        server.listen(0, "127.0.0.1", () => {
            server.off("error", reject)
            resolve()
        })
    })
    const address = server.address()
    if (!address || typeof address === "string") {
        throw new Error("Webhook server did not provide a TCP address")
    }

    return { receivedRequest, server, url: `http://127.0.0.1:${address.port}` }
}

const closeServer = (server: http.Server): Promise<void> => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
})

describe("sendReportNotifications transport", () => {
    it("sends a Slack notification through the real Axios HTTP transport", async () => {
        const { receivedRequest, server, url } = await startWebhookServer()
        const originalFeUrl = process.env.FE_URL
        process.env.FE_URL = "https://reporter.example"
        ;(db.manyOrNone as jest.Mock).mockResolvedValue([{ channel: "slack", url }])

        try {
            await sendReportNotifications("project", "scenario", "item-id", OVERVIEW)
            const request = await receivedRequest

            expect(request.headers["content-type"]).toEqual("application/json")
            expect(JSON.parse(request.body)).toEqual(expect.objectContaining({
                blocks: expect.any(Array),
            }))
        } finally {
            if (originalFeUrl === undefined) {
                delete process.env.FE_URL
            } else {
                process.env.FE_URL = originalFeUrl
            }
            await closeServer(server)
        }
    })
})
