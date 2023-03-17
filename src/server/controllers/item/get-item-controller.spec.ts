import { Response } from "express"
import { IGetUserAuthInfoRequest } from "../../middleware/request.model"
import { getItemController } from "./get-item-controller"
import { db } from "../../../db/db"

jest.mock("../../../db/db")
const mockResponse = () => {
    const res: Partial<Response> = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}
describe("getItemController", () => {

    it("should fetch data from db", async () => {
        const response = mockResponse()
        const findItemQuerySpy = jest.spyOn(require("../../queries/items"), "findItem")
        const findItemStatsQuerySpy = jest.spyOn(require("../../queries/items"), "findItemStats")
        const getMonitoringDataQuerySpy = jest.spyOn(require("../../queries/items"), "getMonitoringData")


        const request = {
            params: { projectName: "project", scenarioName: "scenario", itemId: "id" },
            user: { userId: "testUser" },
        };

        (db.one as any).mockResolvedValueOnce({
            plot_data: {},
            extra_plot_data: {},
            histogram_plot_data: {},
            note: "my note",
            environment: "environment",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            base_id: null,
            status: "1", hostname: null, reportStatus: "Ready", thresholds: {},
            analysisEnabled: true, zeroErrorToleranceEnabled: true, topMetricsSettings: {}, name: null,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            scatter_plot_data: [[1679035520, 30], [1679035688, 20]],
        });

        (db.one as any).mockResolvedValueOnce({ stats: {}, overview: {}, sutOverview: {} });

        (db.manyOrNone as any).mockResolvedValueOnce([])
        await getItemController(request as unknown as IGetUserAuthInfoRequest,
            response as unknown as Response)
        expect(findItemQuerySpy).toHaveBeenCalledTimes(1)
        expect(findItemStatsQuerySpy).toHaveBeenCalledTimes(1)
        expect(getMonitoringDataQuerySpy).toHaveBeenCalledTimes(1)
        expect(response.json).toHaveBeenCalledTimes(1)
        expect(response.json).toHaveBeenLastCalledWith({
            analysisEnabled: true,
            baseId: null,
            environment: "environment",
            extraPlotData: {},
            histogramPlotData: {},
            hostname: null,
            isBase: false,
            monitoring: {
                cpu: {
                    data: [],
                    max: undefined,
                },
            },
            name: null,
            note: "my note",
            overview: {},
            plot: {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                scatterPlotData: [[1679035520, 30], [1679035688, 20]]
            },
            reportStatus: "Ready",
            statistics: {},
            status: "1",
            sutOverview: {},
            thresholds: {},
            topMetricsSettings: {},
            userSettings: {
                requestStats: undefined,
            },
            zeroErrorToleranceEnabled: true,
        })

    })
})


