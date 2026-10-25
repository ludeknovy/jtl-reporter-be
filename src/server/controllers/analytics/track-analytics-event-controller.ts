import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { AnalyticsEvent, ComparisonType, UiAnalyticsEvent } from "../../utils/analytics/anyltics-event"
import { StatusCode } from "../../utils/status-code"

export const trackAnalyticsEventController = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { event, comparisonType } = req.body as { event: UiAnalyticsEvent; comparisonType?: ComparisonType }
    try {
        await AnalyticsEvent.trackUiEvent(event, comparisonType ? { comparisonType } : {})
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch(error) {
        // Analytics must never affect the application.
    }
    return res.status(StatusCode.NoContent).send()
}
