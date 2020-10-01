// eslint-disable-next-line @typescript-eslint/naming-convention
const Joi = require('joi');

export const createNewProjectSchema = {
  projectName: Joi.string().min(3).max(50).required()
};

export const projectNameParam = {
  projectName: Joi.string().required()
};

export const newScenarioSchema = {
  scenarioName: Joi.string().min(1).max(50).required()
};
