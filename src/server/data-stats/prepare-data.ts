import { stats, itemOverview } from './statistics';
import { roundNumberTwoDecimals } from './helper/stats-fc';
import * as moment from 'moment';

export const prepareDataForSavingToDb = (inputData): ItemDbData => {
  const sortedData = normalizeAndSortData(inputData);
  const itemStats = stats(sortedData);
  const overview = itemOverview(sortedData);
  const startTime = new Date(sortedData.find(_ => _.timeStamp).timeStamp);
  return { itemStats, overview, startTime, sortedData };
};

export const prepareDataForSavingToDbFromMongo = (overviewData, labelData) => {
  const startDate = new Date(overviewData.start);
  const endDate = new Date(overviewData.end);
  return {
    overview: {
      percentil: roundNumberTwoDecimals(overviewData.percentil),
      maxVu: overviewData.maxVu,
      avgResponseTime: overviewData.avgResponse.toFixed(0),
      errorRate: (overviewData.failed / overviewData.total) * 100,
      throughput: roundNumberTwoDecimals(overviewData.total / ((overviewData.end - overviewData.start) / 1000)),
      avgLatency: roundNumberTwoDecimals(overviewData.avgLatency),
      avgConnect: roundNumberTwoDecimals(overviewData.avgConnect),
      startDate,
      endDate,
      duration: roundNumberTwoDecimals((endDate.getTime() - startDate.getTime()) / 1000 / 60),
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
      n0: _.percentil90,
    }))
  };
};

export const prepareChartDataForSavingFromMongo = (overviewData: ChartOverviewData[], labelData: ChartLabelData[]) => {
  const labels = [...new Set(labelData.map((_) => _._id.label))];
  return {
    threads: overviewData.map((_) => [moment(_._id).valueOf(), _.threads]),
    overAllFailRate: {
      data: overviewData.map((_) => [moment(_._id).valueOf(), _.errorRate]),
      name: `errors`,
    },
    overallTimeResponse: {
      data: overviewData.map((_) => [moment(_._id).valueOf(), _.avgResponseTime]),
      name: `response time`,
    },
    overallThroughput: {
      data: overviewData.map((_) => [moment(_._id).valueOf(), roundNumberTwoDecimals(_.count / _.interval)]),
      name: `throughput`
    },
    throughput: labels.map((label) => ({
      // tslint:disable-next-line: max-line-length
      data: labelData.filter((_) => _._id.label === label).map((_) => [moment(_._id.interval).valueOf(), roundNumberTwoDecimals(_.count / _.interval)]),
      name: label
    })),
    responseTime: labels.map((label) => ({
      // tslint:disable-next-line: max-line-length
      data: labelData.filter((_) => _._id.label === label).map((_) => [moment(_._id.interval).valueOf(), _.avgResponseTime]),
      name: label
    }))
  };

}

export const normalizeAndSortData = (inputData) => {
  return inputData.map(_ => {
    return normalizeData(_);
  }).sort((curr, next) => {
    return curr.timeStamp - next.timeStamp;
  });
};

export const normalizeData = (_): OutputData => {
  _.timeStamp = parseInt(_.timeStamp, 10);
  _.elapsed = parseInt(_.elapsed, 10);
  _.responseCode = parseInt(_.responseCode, 10);
  _.bytes = parseInt(_.bytes, 10);
  _.grpThreads = parseInt(_.grpThreads, 10);
  _.allThreads = parseInt(_.allThreads, 10);
  _.Latency = parseInt(_.Latency, 10);
  _.Connect = parseInt(_.Connect, 10);
  _.success = (_.success = 'true');
  return _;
};

export const dataForFb = (_) => {
  _.timeStamp = new Date(parseInt(_.timeStamp, 10));
  _.elapsed = parseInt(_.elapsed, 10);
  _.responseCode = parseInt(_.responseCode, 10);
  _.bytes = parseInt(_.bytes, 10);
  _.grpThreads = parseInt(_.grpThreads, 10);
  _.allThreads = parseInt(_.allThreads, 10);
  _.Latency = parseInt(_.Latency, 10);
  _.Connect = parseInt(_.Connect, 10);
  _.success = _.success === 'true';
  return _;
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
  Latency: string;
  Hostname: string;
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
  Latency: number;
  Hostname: string;
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
}

interface ChartLabelData {
  _id: {
    interval: Date,
    label: string,
  };
  min: Date;
  max: Date;
  count: number;
  threads: number;
  avgResponseTime: number;
  interval: number;
}
