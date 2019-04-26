const Joi = require('joi');
import * as boom from 'boom';

export const bodySchemaValidator = (schema) => {
  return schemaValidator(schema, Property.Body);
};

export const paramsSchemaValidator = (schema) => {
  return schemaValidator(schema, Property.Params);
};

export const queryParamsValidator = (schema) => {
  return schemaValidator(schema, Property.Query);
};

const schemaValidator = (schema, property) => {
  return (req, res, next) => {
    const { error } = Joi.validate(req[property], schema);
    const valid = error == null;
    if (valid) { next(); } else {
      const { details } = error;
      const message = details.map(i => i.message).join(',');
      return next(boom.badRequest(message));
    }
  };
};

export const enum Property {
  Body = 'body',
  Params = 'params',
  Query = 'query'
}

interface IValidationInput {
  property: Property;
  schema: any;
}
