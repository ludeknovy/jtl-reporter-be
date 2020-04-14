import { generateToken } from "../../server/controllers/auth/helper/token-generator";

describe('token generator', () => {
  it('should return valid token', () => {
    const ID = 'test-id';
    const token = generateToken(ID);
    let buff = new Buffer(token.split('.')[1], 'base64');
    const tokenData = JSON.parse(buff.toString());
    expect(tokenData.userId).toEqual(ID);
  });
});