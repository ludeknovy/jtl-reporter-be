import {NextFunction, Request, Response} from 'express';
import {db} from '../../../db/db';
import {getProject } from '../../queries/projects';

export const getProjectController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName } = req.params;
  const projectSettings = await db.one(getProject(projectName));
  res.status(200).send(projectSettings);
};
