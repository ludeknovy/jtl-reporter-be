import { Request, Response } from "express"
import { db } from "../../../../db/db"
import { scenarioTrends } from "../../../queries/scenario"

export const getScenarioTrendsController = async (req: Request, res: Response) => {
  const { projectName, scenarioName } = req.params
  const data = await db.any(scenarioTrends(projectName, scenarioName))
  const networkAdjustedData = data.map((_) => {
    const { bytesPerSecond, bytesSentPerSecond } = _.overview
    const network = bytesPerSecond + bytesSentPerSecond
    return {
      id: _.id,
      overview: {
        ..._.overview,
        network,
      },
    }
  })
  res.status(200).send(networkAdjustedData)
}
