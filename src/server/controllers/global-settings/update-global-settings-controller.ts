import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { Response } from "express"
import { updateGlobalSettings } from "../../queries/global-settings"
import { db } from "../../../db/db"
import { StatusCode } from "../../utils/status-code"

export const updateGlobalSettingsController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const updatedSettings = req.body
    await db.none(updateGlobalSettings(updatedSettings.projectAutoprovisioning))
    return res.status(StatusCode.NoContent).send()

}
