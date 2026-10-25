import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { AnalyticsEvent, ComparisonType, UiAnalyticsEvent } from "../../utils/analytics/anyltics-event"
import { StatusCode } from "../../utils/status-code"

export const trackAnalyticsEventController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { event, comparisonType } = req.body as { event: UiAnalyticsEvent; comparisonType?: ComparisonType }
    await AnalyticsEvent.trackUiEvent(event, comparisonType ? { comparisonType } : {})
    return res.status(StatusCode.NoContent).send()
}
