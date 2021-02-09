import { config } from '../../config';
import { linkUrl } from './link-url';

describe('Link url', () => {
  it('should return undefined when no FE_URL provided', () => {
    const url = linkUrl('test', 'test', 'id');
    expect(url).toBeUndefined();
  });
  it('should retrun correct url when FE_URL provided', () => {
    config.feUrl = 'http://localhost';
    const url = linkUrl('test', 'test', 'id');
    expect(url).toEqual('http://localhost/project/test/scenario/test/items/id');
  });
});
