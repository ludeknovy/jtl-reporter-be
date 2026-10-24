import { logger } from "../../../../logger"

let processingQueue = Promise.resolve()

export const queueItemProcessing = (fn: () => Promise<void>): Promise<void> => {
    const job = processingQueue.then(fn)

    processingQueue = job.catch((err) => {
        logger.error("Item processing queue error", err)
    })

    return job
}
