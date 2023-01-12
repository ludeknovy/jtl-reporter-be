import { Request, Response } from "express"
import { db } from "../../../db/db"
import { getErrorsForLabel } from "../../queries/items"
import { StatusCode } from "../../utils/status-code"

export const getLabelErrorsController = async (req: Request, res: Response) => {
  const { itemId, label } = req.params
  const queryResult = await db.query(getErrorsForLabel(itemId, label))
  const stat = queryResult.reduce((acc, { error: { rc } }) => {
    // eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-expressions
    acc[rc]
      ? acc[rc]++
      : acc[rc] = 1
    return acc
  }, {})
  res.status(StatusCode.Ok).json({ stat })
}
