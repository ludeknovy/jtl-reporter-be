import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { Response } from "express"
import { db } from "../../../db/db"
import { getGlobalSettings } from "../../queries/global-settings"
import { StatusCode } from "../../utils/status-code"

export const getGlobalSettingsController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const globalSettings = await db.one(getGlobalSettings())
    res.status(StatusCode.Ok).json({
        projectAutoProvisioning: globalSettings.project_auto_provisioning,
    })
}
