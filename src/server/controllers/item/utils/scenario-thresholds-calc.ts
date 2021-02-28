import { Overview } from '../../../data-stats/prepare-data';
import { divide } from 'mathjs';


export const scenarioThresholdsCalc = (overviewData: Overview, scenarioMetrics: Thresholds, thresholds: Thresholds) => {
  const percentileDiff = (overviewData.percentil / scenarioMetrics.percentile) * 100;
  const throughputDiff = (overviewData.throughput / scenarioMetrics.throughput) * 100;
  const errorRateDiff = scenarioMetrics.errorRate === 0 ? 0 : divide(overviewData.errorRate, 0.1) * 100;

  const percentilePass = percentileDiff < 100 + thresholds.percentile;
  const errorRatePass = errorRateDiff < 100 + thresholds.errorRate;
  const throughputPass = throughputDiff >= 100 - thresholds.throughput;

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


interface Thresholds {
  percentile: number;
  throughput: number;
  errorRate: number;
};
