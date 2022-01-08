import { Request, Response } from "express"
import { db } from "../../../db/db"
import { dashboardStats } from "../../queries/items"

export const getProjectStatsController = async (req: Request, res: Response) => {
  const { avgVu, avgDuration, totalDuration, totalCount } = await db.one(dashboardStats())
  res.status(200).send({
    avgVu: avgVu ? parseInt(avgVu, 10) : 0,
    avgDuration: avgDuration ? parseInt(avgDuration, 10) : 0,
    totalDuration: totalDuration ? parseInt(totalDuration, 10) : 0,
    totalRunCount: totalCount ? parseInt(totalCount, 10) : 0,
  })
}
