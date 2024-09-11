import { db } from "../../../db/db"
import { logger } from "../../../logger"

const maxAttempts = 30
const timeout = 2000

export async function setInstanceId() {

    for (let i = 0; i < maxAttempts; i++) {
        try {
            const result = await db.oneOrNone("SELECT instance FROM jtl.global")
            if (result) {
                // Do whatever you need with result in non-blocking manner
                console.log(result)
                return
            }
        } catch(error) {
            logger.debug("instance id could not be loaded " + error)
        } finally {
            // Sleep for 2 second if result is undefined
            await new Promise(resolve => setTimeout(resolve, timeout))
        }
    }

    // set default id
}
