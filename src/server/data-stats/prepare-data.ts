import { stats, itemOverview } from './statistics';

export const prepareDataForSavingToDb = (inputData): ItemDbData => {
    const sortedData = normalizeAndSortData(inputData);
    const itemStats = stats(sortedData);
    const overview = itemOverview(sortedData);
    const startTime = new Date(sortedData.find(_ => _.timeStamp).timeStamp);
    return { itemStats, overview, startTime, sortedData };
};

export const normalizeAndSortData = (inputData) => {
  return inputData.map(_ => {
    _.timeStamp = parseInt(_.timeStamp, 10);
    _.elapsed = parseInt(_.elapsed, 10);
    _.responseCode = parseInt(_.responseCode, 10);
    _.bytes = parseInt(_.bytes, 10);
    _.grpThreads = parseInt(_.grpThreads, 10);
    _.allThreads = parseInt(_.allThreads, 10);
    _.Latency = parseInt(_.Latency, 10);
    _.Connect = parseInt(_.Connect, 10);
    return _;
  }).sort((curr, next) => {
    return curr.timeStamp - next.timeStamp; });
};

export interface ItemDbData {
  itemStats: any;
  overview: any;
  startTime: Date;
  sortedData: any;
}
