import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { findScenarios, findScenariosData } from '../../queries/scenario';

export const getScenariosController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName } = req.params;
  const scenarios = await db.any(findScenarios(projectName));
  const scenarioData = await db.any(findScenariosData(projectName));
  const groupedData = scenarioData.reduce((accumulator, nextValue) => {
    const accIndex = accumulator.findIndex(_ => _.name === nextValue.name);
    if (accIndex === -1) {
      accumulator.push({ name: nextValue.name, id: nextValue.scenario_id, data: [nextValue.overview || undefined] });
    } else {
      accumulator[accIndex].data.push(nextValue.overview);
    }
    return accumulator;
  }, []);
  // add scenario with no data
  scenarios.forEach(scenario => {
    const scenarioExists = groupedData.find(data => data.name === scenario.name);
    if (!scenarioExists) {
      groupedData.push({ name: scenario.name, id: scenario.id, data: [] });
    }
  });
  res.status(200).send(groupedData);
};
