import { Overview } from '../../../data-stats/prepare-data';
import { divide } from 'mathjs';


// eslint-disable-next-line max-len
export const scenarioThresholdsCalc = (overviewData: Overview, scenarioMetrics: Thresholds<string>, thresholds: Thresholds<string>) => {
  if (!scenarioMetrics.errorRate || !scenarioMetrics.percentile || !scenarioMetrics.throughput) {
    return undefined;
  }
  const percentileDiff = (overviewData.percentil / parseFloat(scenarioMetrics.percentile)) * 100;
  const throughputDiff = (overviewData.throughput / parseFloat(scenarioMetrics.throughput)) * 100;
  const errorRateDiff = parseFloat(scenarioMetrics.errorRate) === 0
    ? 100 + overviewData.errorRate
    : divide(overviewData.errorRate, scenarioMetrics.errorRate) * 100;

  const percentilePass = percentileDiff < (100 + parseFloat(thresholds.percentile));
  const errorRatePass = errorRateDiff < (100 + parseFloat(thresholds.errorRate));
  const throughputPass = throughputDiff >= (100 - parseFloat(thresholds.throughput));

  return {
    passed: percentilePass && throughputPass && errorRatePass,
    result: {
      percentile: {
        passed: percentilePass,
        diffValue: percentileDiff
      },
      throughput: {
        passed: throughputPass,
        diffValue: throughputDiff
      },
      errorRate: {
        passed: errorRatePass,
        diffValue: errorRateDiff
      }
    },
    scenarioMetrics,
    thresholds
  };
};


interface Thresholds<T> {
  percentile: T;
  throughput: T;
  errorRate: T;
};
