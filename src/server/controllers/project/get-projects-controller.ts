import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { findProjects } from '../../queries/projects';

export const getProjectsController = async (req: Request, res: Response, next: NextFunction) => {
  const projects = await db.any(findProjects());
  res.status(200).send(projects);
};
