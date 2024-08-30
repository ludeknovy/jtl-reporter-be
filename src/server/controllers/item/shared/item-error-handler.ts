import { DataStreamingToDatabaseException } from "../../../errors/data-streaming-to-database-exception"
import { logger } from "../../../../logger"
import { DataParsingException } from "../../../errors/data-parsing-exception"
import { DataProcessingException } from "../../../errors/data-processing-exceptions"
import { UnlinkingFileException } from "../../../errors/unlinking-file-exception"
import { db } from "../../../../db/db"
import { updateItem } from "../../../queries/items"
import { ReportStatus } from "../../../queries/items.model"

export const itemErrorHandler = async (itemId: string, processingError: Error) => {
    if (processingError instanceof DataStreamingToDatabaseException) {
        // eslint-disable-next-line max-len
        logger.error(`Error occurred during data parsing and saving into database: ${processingError.message}, item_id: ${itemId}`)
    } else if (processingError instanceof DataParsingException) {
        // eslint-disable-next-line max-len
        logger.error(`Error occurred during data parsing or manipulation: ${processingError.message}, item_id: ${itemId}`)
    } else if (processingError instanceof DataProcessingException) {
        // eslint-disable-next-line max-len
        logger.error(`Error occurred during samples aggregation in database: ${processingError.message}, item_id: ${itemId}`)
    } else if (processingError instanceof UnlinkingFileException) {
        // eslint-disable-next-line max-len
        logger.error(`Error occurred during deleting of uploaded file: ${processingError.message}, item_id: ${itemId}`)
    } else {
        logger.error(`Unexpected error occurred: ${processingError.message}, item_id: ${itemId}`)
    }

    try {
        logger.info(`Trying to set item: ${itemId} to error state.`)
        await db.none(updateItem(itemId, ReportStatus.Error, null))
    } catch(e) {
        logger.error(`It was not possible to set item ${itemId} to error state: ${e}`)
    }
}
