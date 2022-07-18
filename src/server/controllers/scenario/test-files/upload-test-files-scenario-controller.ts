import { Request, Response, NextFunction } from "express"
import { StatusCode } from "../../../utils/status-code"
import * as multer from "multer"
import * as boom from "boom"
import { db } from "../../../../db/db"
import {
deleteExecutionFiles, getExecutionFiles, getScenario, saveExecutionFile,
} from "../../../queries/scenario"
import * as fs from "fs"

const upload = multer(
    {
        dest: "./uploads",
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        limits: { fieldSize: 2048 * 1024 * 1024 },
    }).fields([
    { name: "jmx", maxCount: 1 },
])

export const uploadTestFileScenarioController = async (req: Request, res: Response, next: NextFunction) => {

    // eslint-disable-next-line require-await
    upload(req, res, async error => {
        if (error) {
            return next(boom.badRequest(error.message))
        }

        const { projectName, scenarioName } = req.params

        const scenario = await db.oneOrNone(getScenario(projectName, scenarioName))

        if (!scenario?.id) {
            return next(boom.badRequest(`Scenario not found`))
        }

        const executionFiles = await db.manyOrNone(getExecutionFiles(scenario.id))
        if (executionFiles) {
            await db.query(deleteExecutionFiles(scenario.id))
        }

        const { jmx } = req.files as unknown as { jmx: ReceivedFile[] }


        try {
            const jmxFile = jmx[0]

            await db.query(saveExecutionFile(scenario.id, fs.readFileSync(jmxFile.path), jmxFile.originalname))
        } catch(exeception) {
            console.log(exeception)
        }

        res.status(StatusCode.Created).send()

    })

}


interface ReceivedFile {
    path: string
    originalname: string
}
