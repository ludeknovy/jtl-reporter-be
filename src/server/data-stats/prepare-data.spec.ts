import {
  calculateDistributedThreads,
  prepareDataForSavingToDb,
  stringToNumber, transformDataForDb
} from './prepare-data';

describe('prepare data', () => {
  describe('transformDataForDb', () => {
    it('should return undefined when unable to process data', () => {
      const result = transformDataForDb({}, 'itemId');
      expect(result).toBeUndefined();
    });
    it('should correctly proccess data', () => {
      const inputData = {
        bytes: '792',
        sentBytes: '124',
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
      const result = transformDataForDb(inputData, 'itemId');
      expect(result).toEqual({
        bytes: 792,
        sentBytes: 124,
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
        itemId: 'itemId',
        threadName: 'Thread 1-1',
        responseCode: '200',
        responseMessage: '',
        sutHostname: undefined
      });
    });
    it('should return sutHostname when URL provided with valid url', () => {
      const inputData = {
        bytes: '792',
        sentBytes: '123',
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
      const result = transformDataForDb(inputData, 'itemId');
      expect(result.sutHostname).toEqual('example.com');
    });
    it('should return sutHostname undefined when URL contains empty url', () => {
      const inputData = {
        bytes: '792',
        sentBytes: '123',
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
      const result = transformDataForDb(inputData, 'itemId');
      expect(result.sutHostname).toBeUndefined();
    });
    it('should return sutHostname undefined when URL contains invalid url', () => {
      const inputData = {
        bytes: '792',
        sentBytes: '123',
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
      const result = transformDataForDb(inputData, 'itemId');
      expect(result.sutHostname).toBeUndefined();
    });
    it('should process the data even when sentBytes not provided', () => {
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
      const result = transformDataForDb(inputData, 'itemId');
      expect(result.sentBytes).toEqual(0);
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
          time: new Date(1555399218911),
          hostname: 'generator-1',
          threads: 10
        },
        {
          time: new Date(1555399218911),
          hostname: 'generator-2',
          threads: 10
        },
        {
          time: new Date(1555399218911),
          hostname: 'generator-3',
          threads: 5
        }
      ];
      const distributedThreads = calculateDistributedThreads(inputData);
      expect(distributedThreads).toEqual([[1555399218911, 25]]);
    });
  });
  describe('prepareDataForSavingToDb', () => {
    const overviewData = {
      _id: null,
      start: new Date('2021-03-29T10:57:10.882Z'),
      end: new Date('2021-03-29T11:27:10.171Z'),
      avg_connect: 5.802922997682204,
      avg_latency: 105.62091166623745,
      avg_response: 105.72559876384238,
      bytes_received_total: 123123,
      bytes_sent_total: 69848465,
      total: 46596,
      n90: 271,
      number_of_failed: 3
    };
    const labelsData = [
      {
        label: 'label1',
        min_response: 227,
        max_response: 1325,
        avg_response: 286.97317596566523,
        bytes_received_total: 123,
        bytes_sent_total: 1231,
        total_samples: 932,
        start: new Date('2021-03-29T10:59:01.561Z'),
        end: new Date('2021-03-29T11:27:07.702Z'),
        n90: 343,
        n95: 367,
        n99: 418,
        number_of_failed: 0
      },
      {
        label: 'label2',
        min_response: 35,
        max_response: 118,
        avg_response: 44.93503480278422,
        total_samples: 431,
        bytes_received_total: 123,
        bytes_sent_total: 1231,
        start: new Date('2021-03-29T11:00:53.221Z'),
        end: new Date('2021-03-29T11:27:01.650Z'),
        n90: 50,
        n95: 56,
        n99: 93,
        number_of_failed: 0
      }
    ];
    const statusCodes = [
      { label: 'label2', status_code: '200', count: 433 },
      { label: 'label1', status_code: '200', count: 932 }];
    const responseFailures = [
      { label: 'label1', response_message: 'failure', count: 31 },
      { label: 'label2', response_message: 'failure2', count: 1 }
    ];
    const { overview, labelStats } = prepareDataForSavingToDb(overviewData, labelsData, [],
      statusCodes, responseFailures);
    expect(overview).toEqual({
      percentil: 271,
      maxVu: undefined,
      avgResponseTime: 106,
      errorRate: 0.01,
      throughput: 25.9,
      bytesPerSecond: 38820.04,
      bytesSentPerSecond: 68.43,
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
        bytesPerSecond: 0.07,
        bytesSentPerSecond: 0.73,
        throughput: 0.55,
        n9: 418,
        n5: 367,
        n0: 343,
        statusCodes: [{ count: 932, statusCode: '200' }],
        responseMessageFailures: [{
          count: 31, responseMessage: 'failure'
        }]
      },
      {
        label: 'label2',
        samples: 431,
        avgResponseTime: 45,
        minResponseTime: 35,
        maxResponseTime: 118,
        errorRate: 0,
        bytesPerSecond: 0.08,
        bytesSentPerSecond: 0.78,
        throughput: 0.27,
        n9: 93,
        n5: 56,
        n0: 50,
        statusCodes: [{ count: 433, statusCode: '200' }],
        responseMessageFailures: [{
          count: 1, responseMessage: 'failure2'
        }]
      }]);

  });
});
