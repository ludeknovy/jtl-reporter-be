import { config } from '../../../config';
import * as jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  const token = jwt.sign({
    userId: id
  },
    config.jwtToken, { expiresIn: '7d' }
  );
  return token;
};
