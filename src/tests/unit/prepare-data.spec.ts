import { stringToNumber, transformDataForFb } from '../../server/data-stats/prepare-data';

describe('prepare data', () => {
  describe('transformDataForFb', () => {
    it('should return undefined when unable to process data', () => {
      const result = transformDataForFb({});
      expect(result).toBeUndefined();
    });
    it('should correctly proccess data', () => {
      const inputData = {
        bytes: '792',
        label: 'endpoint3',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Connect: '155',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Latency: '190',
        elapsed: '191',
        success: 'true',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Hostname: 'localhost',
        timeStamp: '1555399218911',
        allThreads: '1',
        grpThreads: '1',
        threadName: 'Thread 1-1',
        responseCode: '200',
        responseMessage: ''
      };
      const result = transformDataForFb(inputData);
      expect(result).toEqual({
        bytes: 792,
        label: 'endpoint3',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Connect: 155,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Latency: 190,
        elapsed: 191,
        success: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Hostname: 'localhost',
        timeStamp: new Date(1555399218911),
        allThreads: 1,
        grpThreads: 1,
        threadName: 'Thread 1-1',
        responseCode: 200,
        responseMessage: ''
      });
    });
  });
  describe('stringToNumber', () => {
    it('should convert string to number', () => {
      const result = stringToNumber('1', 10);
      expect(result).toBe(1);
    });
    it('should throw an error when unablqe to convert ', () => {
      expect(() => {
        stringToNumber(undefined, 10);
      }).toThrow();
    });
  });
});
