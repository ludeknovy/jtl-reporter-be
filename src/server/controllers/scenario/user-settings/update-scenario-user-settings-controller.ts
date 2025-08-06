import { IGetUserAuthInfoRequest } from "../../../middleware/request.model"
import { Response } from "express"
import { db } from "../../../../db/db"
import { updateUserScenarioSettings } from "../../../queries/scenario"
import { StatusCode } from "../../../utils/status-code"

export const updateScenariosUserSettingsController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { projectName, scenarioName } = req.params
    const { userId } = req.user

    await db.none(updateUserScenarioSettings(projectName, scenarioName, userId,
        JSON.stringify(req.body.requestStats)))

    res.status(StatusCode.NoContent).send()
}
