import { roundNumberTwoDecimals } from './helper/stats-fc';
import * as moment from 'moment';
import { logger } from '../../logger';

// eslint-disable-next-line max-len
export const prepareDataForSavingToDbFromMongo = (overviewData, labelData, itemId: string): { overview: Overview; labelStats } => {
  try {
    const startDate = new Date(overviewData.start);
    const endDate = new Date(overviewData.end);
    return {
      overview: {
        percentil: roundNumberTwoDecimals(overviewData.percentil),
        maxVu: undefined,
        avgResponseTime: overviewData.avgResponse.toFixed(0),
        errorRate: roundNumberTwoDecimals((overviewData.failed / overviewData.total) * 100),
        throughput: roundNumberTwoDecimals(overviewData.total / ((overviewData.end - overviewData.start) / 1000)),
        bytesPerSecond: roundNumberTwoDecimals(overviewData.bytes / ((overviewData.end - overviewData.start) / 1000)),
        avgLatency: roundNumberTwoDecimals(overviewData.avgLatency),
        avgConnect: roundNumberTwoDecimals(overviewData.avgConnect),
        startDate,
        endDate,
        duration: roundNumberTwoDecimals((endDate.getTime() - startDate.getTime()) / 1000 / 60)
      },
      labelStats: labelData.map((_) => ({
        label: _._id,
        samples: _.samplesCount,
        avgResponseTime: _.avgResponseTime.toFixed(0),
        minResponseTime: _.minResponseTime,
        maxResponseTime: _.maxResponseTime,
        errorRate: roundNumberTwoDecimals(_.failed / _.samplesCount * 100),
        bytes: _.avgBytes.toFixed(2),
        throughput: roundNumberTwoDecimals(
          _.samplesCount / ((_.end - _.start) / 1000)),
        n9: _.percentil99,
        n5: _.percentil95,
        n0: _.percentil90
      }))
    };
  } catch (error) {
    throw new Error(`Error while processing aggregation pipeline results for item: ${itemId} error: ${error}`);
  }
};

export const prepareChartDataForSavingFromMongo = (
  overviewData: ChartOverviewData[], labelData: ChartLabelData[], distributedThreads?: []) => {
  const labels = [...new Set(labelData.map((_) => _._id.label))];
  return {
    threads: distributedThreads?.length > 0
      ? calculateDistributedThreads(distributedThreads)
      : overviewData.map((_) => [moment(_._id).valueOf(), _.threads]) as [number, number][],
    overAllFailRate: {
      data: overviewData.map((_) => [moment(_._id).valueOf(), roundNumberTwoDecimals(_.errorRate)]),
      name: 'errors'
    },
    overallTimeResponse: {
      data: overviewData.map((_) => [moment(_._id).valueOf(), roundNumberTwoDecimals(_.avgResponseTime)]),
      name: 'response time'
    },
    overallThroughput: {
      data: overviewData.map((_) => [moment(_._id).valueOf(), roundNumberTwoDecimals(_.count / _.interval)]),
      name: 'throughput'
    },
    overallNetwork: {
      data: overviewData.map((_) => [moment(_._id).valueOf(), roundNumberTwoDecimals(_.bytes / _.interval)]),
      name: 'network'
    },
    throughput: labels.map((label) => ({
      data: labelData.filter((_) => _._id.label === label)
        .map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.count / _.interval)]),
      name: label
    })),
    responseTime: labels.map((label) => ({
      data: labelData.filter((_) => _._id.label === label)
        .map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.avgResponseTime)]),
      name: label
    })),
    minResponseTime: labels.map((label) => ({
      data: labelData.filter((_) => _._id.label === label)
        .map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.minResponseTime)]),
      name: label
    })),
    maxResponseTime: labels.map((label) => ({
      data: labelData.filter((_) => _._id.label === label)
        .map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.maxResponseTime)]),
      name: label
    })),
    network: labels.map((label) => ({
      data: labelData.filter((_) => _._id.label === label)
        .map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.bytes / _.interval)]),
      name: label
    })),
    percentile90: labels.map((label) => ({
      data: labelData.filter((_) => _._id.label === label)
        .map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.percentile90)]),
      name: label
    })),
    percentile95: labels.map((label) => ({
      data: labelData.filter((_) => _._id.label === label)
        .map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.percentile95)]),
      name: label
    })),
    percentile99: labels.map((label) => ({
      data: labelData.filter((_) => _._id.label === label)
        .map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.percentile99)]),
      name: label
    }))
  };
};

export const calculateDistributedThreads = (distributedThreads: DistributedThreadData[]): [number, number][] => {
  const threadAcc = distributedThreads.reduce((acc, curr) => {
    const interval = moment(curr._id.interval).valueOf();
    if (!acc[interval]) {
      acc[interval] = 0;
    }
    acc[interval] += curr.threads;
    return acc;
  }, {});

  const threads = [];

  for (const key in threadAcc) {
    threads.push([parseInt(key, 10), threadAcc[key]]);
  }
  return threads;
};

export const stringToNumber = (input: string, radix: number) => {
  const result = parseInt(input, radix);
  if (isNaN(result)) {
    throw ('not a number');
  }
  return result;
};

export const transformDataForDb = (_) => {
  try {
    _.timeStamp = new Date(stringToNumber(_.timeStamp, 10));
    _.elapsed = stringToNumber(_.elapsed, 10);
    _.responseCode = stringToNumber(_.responseCode, 10);
    _.bytes = stringToNumber(_.bytes, 10);
    _.grpThreads = stringToNumber(_.grpThreads, 10);
    _.allThreads = stringToNumber(_.allThreads, 10);
    _.Latency = stringToNumber(_.Latency, 10);
    _.Connect = stringToNumber(_.Connect, 10);
    _.success = _.success === 'true';
    return _;
  } catch (error) {
    logger.error(`Error while parsing data: ${error}`);
    return;
  }
};

export interface ItemDbData {
  itemStats: any;
  overview: any;
  startTime: Date;
  sortedData: any;
}

export interface InputData {
  timeStamp: string;
  elapsed: string;
  label: string;
  responseCode: string;
  responseMessage: string;
  threadName: string;
  success: string;
  bytes: string;
  grpThreads: string;
  allThreads: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Latency: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Hostname: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Connect: string;
}

export interface OutputData {
  timeStamp: number;
  elapsed: number;
  label: string;
  responseCode: number;
  responseMessage: string;
  threadName: string;
  success: boolean;
  bytes: number;
  grpThreads: number;
  allThreads: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Latency: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Hostname: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Connect: number;
}

interface ChartOverviewData {
  _id: Date;
  min: Date;
  max: Date;
  count: number;
  threads: number;
  avgResponseTime: number;
  interval: number;
  errorRate: number;
  bytes: number;
}

interface ChartLabelData {
  _id: {
    interval: Date;
    label: string;
  };
  min: Date;
  max: Date;
  count: number;
  threads: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  interval: number;
  bytes: number;
  percentile90: number;
  percentile95: number;
  percentile99: number;
}

export interface Overview {
  percentil: number;
  errorRate: number;
  throughput: number;
  duration: number;
  maxVu: number;
  avgResponseTime: number;
  avgLatency: number;
  avgConnect: number;
  startDate: Date;
  endDate: Date;
  bytesPerSecond: number;
};

interface DistributedThreadData {
  _id: {
    interval: Date;
    hostname: string;
  };
  threads: number;
};
