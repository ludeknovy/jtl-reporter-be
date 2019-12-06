import {
  findMinMax, calculateAverage,
  calculateNthPercentil, calculateAverageTime,
  calculateErrorRate, calculateThroughput,
  roundNumberTwoDecimals
} from './helper/stats-fc';

export const itemOverview = data => {
  const orderedElapsedTime = data.slice().sort((a, b) => a.elapsed - b.elapsed).map(_ => _.elapsed);
  const ninetyPercentilResponseTime = calculateNthPercentil(orderedElapsedTime, 90);
  const maxVu = findMinMax(data.map(_ => _.allThreads)).max;
  const avgResponseTime = Math.round(calculateAverageTime(orderedElapsedTime));
  const errorRate = calculateErrorRate(data);
  const throughput = calculateThroughput(data);
  const avgLatency = calculateAverage(data.map(_ => _.Latency)).toFixed(0);
  const avgConnect = roundNumberTwoDecimals(calculateAverage(data.map(_ => _.Connect)));
  const avgBytes = roundNumberTwoDecimals(calculateAverage(data.map(_ => _.bytes)));
  const startDate = new Date(data[0].timeStamp);
  const endDate = new Date(data[data.length - 1].timeStamp);
  const duration = roundNumberTwoDecimals((endDate.getTime() - startDate.getTime()) / 1000 / 60);


  return {
    percentil: ninetyPercentilResponseTime,
    maxVu,
    avgResponseTime,
    errorRate,
    throughput,
    avgLatency,
    avgBytes,
    avgConnect,
    startDate,
    endDate,
    duration,
  };
};

export const stats = data => {
  const dataPerLabel = data.reduce((accumulator,
    { label, elapsed, success, timeStamp, responseCode, bytes, Connect }) => {
    accumulator[label] = accumulator[label] || {
      responseTimes: [],
      nonOkcodes: 0,
      timeStamps: [],
      bytes: [],
      connect: [],
    };
    if (success === 'false') {
      accumulator[label].nonOkcodes += 1;
    }
    accumulator[label].responseTimes.push(elapsed);
    accumulator[label].timeStamps.push(timeStamp);
    accumulator[label].bytes.push(bytes);
    accumulator[label].connect.push(Connect);
    return accumulator;
  }, []);

  return Object.keys(dataPerLabel).map(_ => {
    const { responseTimes, nonOkcodes, timeStamps, bytes, connect } = dataPerLabel[_];
    const total = responseTimes.length;
    const orderedElapsedTime = responseTimes.slice().sort((a, b) => a - b);
    const minMax = findMinMax(responseTimes);
    return {
      label: _,
      samples: total,
      avgResponseTime: parseInt(calculateAverage(responseTimes).toFixed(0), 10),
      minResponseTime: minMax.min,
      maxResponseTime: minMax.max,
      errorRate: roundNumberTwoDecimals(nonOkcodes / total * 100),
      connect: parseInt(calculateAverage(connect).toFixed(0), 10),
      bytes: parseInt(calculateAverage(bytes).toFixed(2), 10),
      throughput: roundNumberTwoDecimals(
        responseTimes.length / ((timeStamps[timeStamps.length - 1] - timeStamps[0]) / 1000)),
      n9: calculateNthPercentil(orderedElapsedTime, 99),
      n5: calculateNthPercentil(orderedElapsedTime, 95),
      n0: calculateNthPercentil(orderedElapsedTime, 90),
    };
  });
};
