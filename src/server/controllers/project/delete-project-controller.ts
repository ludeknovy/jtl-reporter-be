import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { deleteProject } from '../../queries/projects';

export const deleteProjectController = async (req: Request, res: Response, next: NextFunction) => {
  const { projectName } = req.params;
  await db.none(deleteProject(projectName));
  res.status(204).send();
};
