import { calculateDistributedThreads, prepareDataForSavingToDbFromMongo, stringToNumber, transformDataForDb } from './prepare-data';

describe('prepare data', () => {
  describe('transformDataForDb', () => {
    it('should return undefined when unable to process data', () => {
      const result = transformDataForDb({});
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
      const result = transformDataForDb(inputData);
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
    it('should return sutHostname when URL provided with valid url', () => {
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
        responseMessage: '',
        URL: 'https://example.com/styles.css'
      };
      const result = transformDataForDb(inputData);
      expect(result.sutHostname).toEqual('example.com');
    });
    it('should return sutHostname undefined when URL contains empty url', () => {
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
        responseMessage: '',
        URL: ''
      };
      const result = transformDataForDb(inputData);
      expect(result.sutHostname).toBeUndefined();
    });
    it('should return sutHostname undefined when URL contains invalid url', () => {
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
        responseMessage: '',
        URL: 'file'
      };
      const result = transformDataForDb(inputData);
      expect(result.sutHostname).toBeUndefined();
    });
  });
  describe('stringToNumber', () => {
    it('should convert string to number', () => {
      const result = stringToNumber('1', 10);
      expect(result).toBe(1);
    });
    it('should throw an error when unable to convert ', () => {
      expect(() => {
        stringToNumber(undefined, 10);
      }).toThrow();
    });
  });
  describe('calculateDistributedThreads', () => {
    it('should correctly calculate distributed threads', () => {
      const inputData = [
        {
          _id: {
            interval: new Date(1555399218911),
            hostname: 'generator-1'
          },
          threads: 10
        },
        {
          _id: {
            interval: new Date(1555399218911),
            hostname: 'generator-2'
          },
          threads: 10
        },
        {
          _id: {
            interval: new Date(1555399218911),
            hostname: 'generator-3'
          },
          threads: 5
        }
      ];
      const distributedThreads = calculateDistributedThreads(inputData);
      expect(distributedThreads).toEqual([[1555399218911, 25]]);
    });
  });
  describe('prepareDataForSavingToDbFromMongo', () => {
    const overviewData = {
      _id: null,
      start: new Date('2021-03-29T10:57:10.882Z'),
      end: new Date('2021-03-29T11:27:10.171Z'),
      avgConnect: 5.802922997682204,
      avgLatency: 105.62091166623745,
      avgResponse: 105.72559876384238,
      bytes: 69848465,
      total: 46596,
      percentil: 271,
      failed: 3
    };
    const labelsData = [
      {
        _id: 'label1',
        minResponseTime: 227,
        maxResponseTime: 1325,
        avgResponseTime: 286.97317596566523,
        avgBytes: 1921.6502145922748,
        samplesCount: 932,
        start: new Date('2021-03-29T10:59:01.561Z'),
        end: new Date('2021-03-29T11:27:07.702Z'),
        percentil90: 343,
        percentil95: 367,
        percentil99: 418,
        failed: 0
      },
      {
        _id: 'label2',
        minResponseTime: 35,
        maxResponseTime: 118,
        avgResponseTime: 44.93503480278422,
        avgBytes: 572.2737819025522,
        samplesCount: 431,
        start: new Date('2021-03-29T11:00:53.221Z'),
        end: new Date('2021-03-29T11:27:01.650Z'),
        percentil90: 50,
        percentil95: 56,
        percentil99: 93,
        failed: 0
      }
    ];
    const { overview, labelStats } = prepareDataForSavingToDbFromMongo(overviewData, labelsData, []);
    console.log(labelStats)
    expect(overview).toEqual({
      percentil: 271,
      maxVu: undefined,
      avgResponseTime: 106,
      errorRate: 0.01,
      throughput: 25.9,
      bytesPerSecond: 38820.04,
      avgLatency: 105.62,
      avgConnect: 5.8,
      startDate: new Date('2021-03-29T10:57:10.882Z'),
      endDate: new Date('2021-03-29T11:27:10.171Z'),
      duration: 29.99
    });
    expect(labelStats).toEqual([
      {
        label: 'label1',
        samples: 932,
        avgResponseTime: 287,
        minResponseTime: 227,
        maxResponseTime: 1325,
        errorRate: 0,
        bytes: 1921.65,
        throughput: 0.55,
        n9: 418,
        n5: 367,
        n0: 343
      },
      {
        label: 'label2',
        samples: 431,
        avgResponseTime: 45,
        minResponseTime: 35,
        maxResponseTime: 118,
        errorRate: 0,
        bytes: 572.27,
        throughput: 0.27,
        n9: 93,
        n5: 56,
        n0: 50
      }]);

  });
});
