exports.up = (pgm) => {
  pgm.db.select({
    text: `
      SELECT item_data, item_id
      FROM jtl.data
      WHERE data_type = $1;
    `,
    values: ['kpi']
  }).then((result) => {
    return Promise.all(result.map(_ => {
      return pgm.db.query({
        text: `
          UPDATE jtl.item_stat
          SET overview = $3, stats = $2
          WHERE item_id = $1`,
        values: [_.item_id, stats(_.item_data), itemOverview(_.item_data)]
      }).then(res => res)
        .catch(e => console.log(e))
    })).catch(e => console.log(e))
    .then(res => res)
  })
};


const itemOverview = data => {
  const orderedElapsedTime = data.slice().sort((a, b) => a.elapsed - b.elapsed).map(_ => _.elapsed);
  const ninetyPercentilResponseTime = calculateNthPercentil(orderedElapsedTime, 0.90);
  const maxVu = findMinMax(data.map(_ => _.allThreads)).max;
  const avgResponseTime = Math.round(calculateAverageTime(orderedElapsedTime));
  const errorRate = calculateErrorRate(data);
  const throughput = calculateThroughput(data);
  const avgLatency = calculateAverage(data.map(_ => _.Latency)).toFixed(0);
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
    startDate,
    endDate,
    duration
  };
}

const stats = data => {
  const dataPerLabel = data.reduce((accumulator, { label, elapsed, success, timeStamp }) => {
    accumulator[label] = accumulator[label] || { responseTimes: [], nonOkcodes: 0, timeStamps: [] };
    if (success === 'false') {
      accumulator[label].nonOkcodes += 1;
    }
    accumulator[label].responseTimes.push(elapsed);
    accumulator[label].timeStamps.push(timeStamp);
    return accumulator;
  }, []);

  const result = Object.keys(dataPerLabel).map(_ => {
    const { responseTimes, nonOkcodes, timeStamps } = dataPerLabel[_]
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
      throughput: roundNumberTwoDecimals(responseTimes.length / ((timeStamps[timeStamps.length - 1] - timeStamps[0]) / 1000)),
      n9: calculateNthPercentil(orderedElapsedTime, 0.99),
      n5: calculateNthPercentil(orderedElapsedTime, 0.95),
      n0: calculateNthPercentil(orderedElapsedTime, 0.90),
    }
  });
  return JSON.stringify(result)
}


const calculateNthPercentil = (data, percentil) => {
  const percIndex = Math.ceil(percentil * data.length);
  const perc = data[percIndex - 1];
  return roundNumberTwoDecimals(perc);
}

const calculateAverageTime = (data) => {
  return calculateAverage(data);
}

const calculateAverage = (data) => {
  return data.reduce((a, b) => a + b, 0) / data.length
}

const calculateErrorRate = (data) => {
  const numberNonOkCodes = data.filter(_ => _.success === "false");
  const rate = (numberNonOkCodes.length / data.length) * 100
  return roundNumberTwoDecimals(rate);
}

const calculateThroughput = data => {
  const startTime = data[0].timeStamp
  const endTime = data[data.length - 1].timeStamp
  const totalTimeInSeconds = (endTime - startTime) / 1000;
  const throughput = data.length / totalTimeInSeconds
  return roundNumberTwoDecimals(throughput)
}

const roundNumberTwoDecimals = number => {
  return Math.round(number * 100) / 100;
}

const findMinMax = data => {
  return data.reduce((previousValue, currentValue) => {
    previousValue.max = previousValue.max > currentValue ? previousValue.max : currentValue
    previousValue.min = previousValue.min < currentValue ?
    previousValue.min : currentValue
    return previousValue;
  }, {min: undefined, max: undefined});
};
