exports.up = async (pgm) => {
  try {
    const ids = await pgm.db.select({
      text: `
      SELECT item_id
      FROM jtl.data
      WHERE data_type = $1;
      `,
      values: ['kpi']
    });
    ids.map(async ({ item_id }) => {
      const data = await pgm.db.select({
        text: `
      SELECT item_data
      FROM jtl.data
      WHERE data_type = $1 AND item_id = $2`,
        values: ['kpi', item_id]
      })
      await pgm.db.query({
        text: `UPDATE jtl.item_stat SET overview = $3, stats = $2 WHERE item_id = $1`,
        values: [item_id, JSON.stringify(stats(data[0].item_data)), JSON.stringify(itemOverview(data[0].item_data))]
      })
    });
  } catch (error) {
    console.log(error)
  }
}

const itemOverview = data => {
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
  const errors = data.filter(_ => _.success === 'false')
    .reduce((accumulator, { responseCode }) => {
      if (!accumulator[responseCode]) {
        accumulator[responseCode] = 0;
      }
      accumulator[responseCode] += 1;
      return accumulator;
    }, {});

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
    errors
  };
};

const stats = data => {
  const dataPerLabel = data.reduce((accumulator,
    { label, elapsed, success, timeStamp, responseCode, bytes, Connect }) => {
    accumulator[label] = accumulator[label] || {
      responseTimes: [],
      nonOkcodes: 0,
      timeStamps: [],
      bytes: [],
      connect: [],
      errors: {}
    };
    if (success === 'false') {
      accumulator[label].nonOkcodes += 1;
      accumulator[label].errors[responseCode] = accumulator[label].errors[responseCode] || 0;
      accumulator[label].errors[responseCode] += 1;
    }
    accumulator[label].responseTimes.push(elapsed);
    accumulator[label].timeStamps.push(timeStamp);
    accumulator[label].bytes.push(bytes);
    accumulator[label].connect.push(Connect);
    return accumulator;
  }, []);

  return Object.keys(dataPerLabel).map(_ => {
    const { responseTimes, nonOkcodes, timeStamps, errors, bytes, connect } = dataPerLabel[_];
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
      errors,
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


const calculateNthPercentil = (data, percentil) => {
  if (data.length < 2) {
    return roundNumberTwoDecimals(data[0])
  }
  const percIndex = Math.ceil((percentil / 100) * data.length);
  const perc = data[percIndex - 1];
  return roundNumberTwoDecimals(perc);
};

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
  }, { min: undefined, max: undefined });
};
