export const testStats =
  // eslint-disable-next-line max-len
  [{ n0: 741, n5: 741, n9: 741, label: "Authorize", errors: {}, samples: 1, errorRate: 0, throughput: null, avgResponseTime: 741, maxResponseTime: 741, minResponseTime: 741 }, { n0: 152, n5: 152, n9: 152, label: "Authorize 01", errors: {}, samples: 1, errorRate: 0, throughput: null, avgResponseTime: 152, maxResponseTime: 152, minResponseTime: 152 }, { n0: 30144, n5: 30210, n9: 30347, label: "getCodetable_insurer", errors: {}, samples: 2285, errorRate: 0, throughput: 6.43, avgResponseTime: 19796, maxResponseTime: 31170, minResponseTime: 118 }, { n0: 32911, n5: 39023, n9: 47910, label: "getCalcStorno", errors: { 401: 665, NaN: 12 }, samples: 2276, errorRate: 29.75, throughput: 6.34, avgResponseTime: 26504, maxResponseTime: 59322, minResponseTime: 83 }, { n0: 48186, n5: 51097, n9: 53548, label: "excelapiTestFormulas", errors: { 401: 788, NaN: 18 }, samples: 2193, errorRate: 36.75, throughput: 6.2, avgResponseTime: 33458, maxResponseTime: 60261, minResponseTime: 891 }]

export const testOverview = {
  // eslint-disable-next-line max-len
  maxVu: 500, errors: { 401: 1453, NaN: 30 }, endDate: "2019-03-06T10:52:49.602Z", duration: 6.02, errorRate: 21.95, percentil: 39268, startDate: "2019-03-06T10:46:48.533Z", avgLatency: 16550, throughput: 18.71, avgResponseTime: 26485, avgConnect: 12, bytesPerSecond: 53432,
}
