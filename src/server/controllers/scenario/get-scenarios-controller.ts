import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { findScenarios, findScenariosData } from '../../queries/scenario';

export const getScenariosController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName } = req.params;
  const scenarios = await db.any(findScenarios(projectName));
  const ids = await db.any(findScenariosData(projectName));
  const groupedData = ids.reduce((accumulator, x) => {
    const accIndex = accumulator.findIndex(_ => _.name === x.name);
    if (accIndex === -1) {
      accumulator.push({ name: x.name, id: x.scenario_id, data: [x.overview || undefined] });
    } else {
      accumulator[accIndex].data.push(x.overview);
    }
    return accumulator;
  }, []);
  scenarios.forEach(_ => {
    const scenario = groupedData.find(__ => __.name === _.name);
    if (!scenario) {
      groupedData.push({ name: _.name, id: _.id, data: [] });
    }
  });
  res.status(200).send(groupedData);
};
