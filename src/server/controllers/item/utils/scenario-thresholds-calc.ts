import { LabelStats } from "../../../data-stats/prepare-data"
import { divide } from "mathjs"

const PERC = 100

// eslint-disable-next-line max-len
export const scenarioThresholdsCalc = (labelStats: LabelStats[], baselineReportStats: LabelStats[], scenarioSettings) => {
    const results = []
    if (!scenarioSettings.errorRate || !scenarioSettings.percentile || !scenarioSettings.throughput) {
        return undefined
    }

    labelStats.forEach(value => {
        const baselineLabelStats = baselineReportStats.find(baselineValue => baselineValue.label === value.label)
        if (baselineLabelStats) {
            const percentileDiff = (value.n0 / baselineLabelStats.n0) * PERC
            const throughputDiff = (value.throughput / baselineLabelStats.throughput) * PERC
            const errorRateDiff = baselineLabelStats.errorRate === 0
                ? PERC + value.errorRate
                : divide(value.errorRate, baselineLabelStats.errorRate as unknown as number) * PERC
            const percentilePass = percentileDiff < (PERC + parseFloat(scenarioSettings.percentile))
            const errorRatePass = errorRateDiff < (PERC + parseFloat(scenarioSettings.errorRate))
            const throughputPass = throughputDiff >= (PERC - parseFloat(scenarioSettings.throughput))
            results.push({
                passed: percentilePass && throughputPass && errorRatePass,
                label: value.label,
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
            })
        } else {
            results.push({
                passed: true,
                label: value.label,
                result: {
                    percentile: {
                        passed: null,
                        diffValue: null,
                    },
                    throughput: {
                        passed: null,
                        diffValue: null,
                    },
                    errorRate: {
                        passed: null,
                        diffValue: null,
                    },
                },
            })
        }
    })
    return {
        passed: results.every(result => result.passed),
        results,
        thresholds: {
            errorRate: scenarioSettings.errorRate,
            throughput: scenarioSettings.throughput,
            percentile: scenarioSettings.percentile,
        },
    }
}

