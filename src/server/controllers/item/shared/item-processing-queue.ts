import { logger } from "../../../logger"

let processingQueue = Promise.resolve()

export const queueItemProcessing = (fn: () => Promise<void>): Promise<void> => {
    return new Promise((resolve, reject) => {
        processingQueue = processingQueue
            .then(() => fn().then(resolve).catch(reject))
            .catch((err) => logger.error("Item processing queue error", err))
    })
}
