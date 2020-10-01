import { config } from '../../../config';
import * as jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const token = jwt.sign({
    userId: id
  },
  config.jwtToken, { expiresIn: '7d' }
  );
  return token;
};
