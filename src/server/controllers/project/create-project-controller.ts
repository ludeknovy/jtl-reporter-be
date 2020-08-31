import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db/db';
import { isExistingProject, createNewProject } from '../../queries/projects';
import * as boom from 'boom';

export const createProjectController = async (req: Request, res: Response, next: NextFunction) => {
  const { body: { projectName } } = req;
  const { exists } = await db.one(isExistingProject(projectName));
  if (!exists) {
    await db.none(createNewProject(projectName));
  } else {
    return next(boom.conflict('Project already exists'));
  }
  res.status(201).send();
};
