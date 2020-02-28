import * as boom from 'boom';

export const authorization = (allowedRoles: AllowedRoles[]) => {
  return (request, response, next) => {
    if (allowedRoles.find((role) => role === request.user.role))
      next(); // role is allowed, so continue on the next middleware
    else {
      next(boom.forbidden(`Not enough permission to do this`));
    }
  };
};


export enum AllowedRoles {
  Admin = 'admin',
  Regular = 'regular',
  Readonly = 'readonly'
}
