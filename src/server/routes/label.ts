import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { paramsSchemaValidator, queryParamsValidator } from '../schema-validator/schema-validator-middleware';
import { wrapAsync } from '../errors/error-handler';
import { labelParamSchema, labelQuerySchema } from '../schema-validator/item-schema';
import { db } from '../../db/db';
import { getLabelHistoryForVu, getLabelHistory, getMaxVuForLabel, getErrorsForLabel } from '../queries/items';
import * as moment from 'moment';

export class LabelRoutes {

  public routes(app: express.Application): void {

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/trend')
      .get(
        paramsSchemaValidator(labelParamSchema),
        queryParamsValidator(labelQuerySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName, itemId, label } = req.params;
          const { environment, virtualUsers } = req.query;
          const queryResult = (virtualUsers && parseInt(virtualUsers, 10) > 0)
            ? await db.query(getLabelHistoryForVu(
              scenarioName, projectName, label,
              itemId, environment, virtualUsers))
            : await db.query(getLabelHistory(
              scenarioName, projectName, label,
              itemId, environment));
          const { timePoints, n0, n5, n9,
            errorRate, throughput, threads } = queryResult.reduce((accumulator, current) => {
              accumulator.timePoints.push(moment(current.start_time).format(`DD.MM.YYYY HH:mm:SS`));
              accumulator.n0.push(current.labels.n0);
              accumulator.n5.push(current.labels.n5);
              accumulator.n9.push(current.labels.n9);
              accumulator.errorRate.push(current.labels.errorRate);
              accumulator.throughput.push(current.labels.throughput);
              accumulator.threads.push(current.max_vu);
              return accumulator;
            }, { timePoints: [], n0: [], n5: [], n9: [], errorRate: [], throughput: [], threads: [] });
          res.status(200).send({
            timePoints,
            n0, n5, n9, errorRate, throughput, threads
          });

        }));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/virtual-users')
      .get(
        paramsSchemaValidator(labelParamSchema),
        queryParamsValidator(labelQuerySchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { projectName, scenarioName, itemId, label } = req.params;
          const { environment } = req.query;
          try {
            const result = await db.query(getMaxVuForLabel(
              scenarioName, projectName, label,
              itemId, environment));
            res.status(200).send({ result });
          } catch (error) {
            return next(error);
          }
        }));

    app.route('/api/projects/:projectName/scenarios/:scenarioName/items/:itemId/label/:label/errors')
      .get(
        paramsSchemaValidator(labelParamSchema),
        wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
          const { itemId, label } = req.params;
          const queryResult = await db.query(getErrorsForLabel(itemId, label));
          const stat = queryResult.reduce((acc, { error: { rc  } }) => {
            acc[rc]
              ? acc[rc]++
              : acc[rc] = 1;
            return acc
          }, {});
          res.status(200).send({ stat });
        }));
  }
}
