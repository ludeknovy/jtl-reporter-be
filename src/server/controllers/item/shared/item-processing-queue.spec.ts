import { queueItemProcessing } from "./item-processing-queue"

describe("queueItemProcessing", () => {
    it("runs jobs in submission order", async () => {
        const firstJob = jest.fn().mockResolvedValue(undefined)
        const secondJob = jest.fn().mockResolvedValue(undefined)

        await Promise.all([
            queueItemProcessing(firstJob),
            queueItemProcessing(secondJob),
        ])

        expect(firstJob).toHaveBeenCalledTimes(1)
        expect(secondJob).toHaveBeenCalledTimes(1)
        expect(firstJob.mock.invocationCallOrder[0]).toBeLessThan(secondJob.mock.invocationCallOrder[0])
    })

    it("continues with the next job after a failed job", async () => {
        const error = new Error("processing failed")
        const failedJob = jest.fn().mockRejectedValue(error)
        const nextJob = jest.fn().mockResolvedValue(undefined)

        await expect(queueItemProcessing(failedJob)).rejects.toThrow(error)
        await expect(queueItemProcessing(nextJob)).resolves.toBeUndefined()

        expect(nextJob).toHaveBeenCalledTimes(1)
    })
})
