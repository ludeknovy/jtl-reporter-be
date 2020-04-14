import { hashPassword, passwordMatch } from '../../server/controllers/auth/helper/passwords';

describe('auth password helper', () => {
  describe('passwordMatch', () => {
    const password = '3OztjGCU3Hs08t0c';
    let hashedPassword;
    beforeAll(async () => {
      hashedPassword = await hashPassword(password);
    });
    it('should return true when correct password provided', async () => {
      const result = await passwordMatch(password, hashedPassword);
      expect(result).toBe(true);
    });
    it('should return false when incorrect password provided', async () => {
      const result = await passwordMatch('test', hashedPassword);
      expect(result).toBe(false);
    });
  });
  describe('hashPassword', () => {
    it('should be able to hash password', async () => {
      const hashedPassword = await hashPassword('test123');
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });
});
