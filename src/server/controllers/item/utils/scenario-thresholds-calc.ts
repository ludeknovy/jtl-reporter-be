import { Overview } from "../../../data-stats/prepare-data"
import { divide } from "mathjs"

const PERC = 100

// eslint-disable-next-line max-len
export const scenarioThresholdsCalc = (overviewData: Overview, scenarioMetrics: Thresholds<string>, thresholds: Thresholds<string>) => {
  if (!scenarioMetrics.errorRate || !scenarioMetrics.percentile || !scenarioMetrics.throughput) {
    return undefined
  }
  const percentileDiff = (overviewData.percentil / parseFloat(scenarioMetrics.percentile)) * PERC
  const throughputDiff = (overviewData.throughput / parseFloat(scenarioMetrics.throughput)) * PERC
  const errorRateDiff = parseFloat(scenarioMetrics.errorRate) === 0
    ? PERC + overviewData.errorRate
    : divide(overviewData.errorRate, scenarioMetrics.errorRate as unknown as number) * PERC

  const percentilePass = percentileDiff < (PERC + parseFloat(thresholds.percentile))
  const errorRatePass = errorRateDiff < (PERC + parseFloat(thresholds.errorRate))
  const throughputPass = throughputDiff >= (PERC - parseFloat(thresholds.throughput))

  return {
    passed: percentilePass && throughputPass && errorRatePass,
    result: {
      percentile: {
        passed: percentilePass,
        diffValue: percentileDiff,
      },
      throughput: {
        passed: throughputPass,
        diffValue: throughputDiff,
      },
      errorRate: {
        passed: errorRatePass,
        diffValue: errorRateDiff,
      },
    },
    scenarioMetrics,
    thresholds,
  }
}


interface Thresholds<T> {
  percentile: T
  throughput: T
  errorRate: T
}
