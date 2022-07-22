import { Request, Response, NextFunction } from "express"
import { StatusCode } from "../../../utils/status-code"
import * as multer from "multer"
import * as boom from "boom"
import { db } from "../../../../db/db"
import {getScenario, getScenarioExecutionFiles, saveExecutionFile} from "../../../queries/scenario"
import * as fs from "fs"
import { logger } from "../../../../logger"

const upload = multer(
    {
        dest: "./uploads",
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        limits: { fieldSize: 2048 * 1024 * 1024 },
    }).fields([
    { name: "file", maxCount: 10 },
])

export const uploadExecutionFilesController = async (req: Request, res: Response, next: NextFunction) => {

    // eslint-disable-next-line require-await
    upload(req, res, async error => {
        if (error) {
            return next(boom.badRequest(error.message))
        }

        const { file } = req.files as unknown as { file: ReceivedFile[] }
        const { projectName, scenarioName } = req.params

        if (!file) {
            return next(boom.badRequest("No files uploaded!"))
        }


        const scenario = await db.oneOrNone(getScenario(projectName, scenarioName))

        if (!scenario?.id) {
            return next(boom.badRequest(`Scenario not found`))
        }


        const executionFiles = await db.manyOrNone(getScenarioExecutionFiles(projectName, scenarioName))
        const filenamesToBeUploaded = file.map(f => f.originalname)

        const filesToOverride = executionFiles.filter(value => filenamesToBeUploaded.includes(value.filename))

        console.log(filesToOverride)

        if (filesToOverride && filesToOverride.length > 0) {
            return next(boom.conflict(`These file(s) already exist(s): ${filesToOverride.map(f => f.filename)}`))
        }

        try {
            for (const f of file) {
                await db.query(saveExecutionFile(scenario.id, fs.readFileSync(f.path), f.originalname))
            }
        } catch(exeception) {
            logger.error(exeception)
        }

        res.status(StatusCode.Created).send()

    })

}


interface ReceivedFile {
    path: string
    originalname: string
}
