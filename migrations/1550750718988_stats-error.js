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
          SET stats = $2
          WHERE item_id = $1`,
        values: [_.item_id, stats(_.item_data)]
      }).then(res => res)
        .catch(e => console.log(e))
    })).catch(e => console.log(e))
      .then(res => res)
  })
};

const stats = data => {
  const dataPerLabel = data.reduce((accumulator, { label, elapsed, success, timeStamp, responseCode }) => {
    accumulator[label] = accumulator[label] || { responseTimes: [], nonOkcodes: 0, timeStamps: [], errors: {} };
    if (success === 'false') {
      accumulator[label].nonOkcodes += 1;
      accumulator[label].errors[responseCode] = accumulator[label].errors[responseCode] || 0;
      accumulator[label].errors[responseCode] += 1
    }
    accumulator[label].responseTimes.push(elapsed);
    accumulator[label].timeStamps.push(timeStamp);
    return accumulator;
  }, []);

  const result = Object.keys(dataPerLabel).map(_ => {
    const { responseTimes, nonOkcodes, timeStamps, errors } = dataPerLabel[_]
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
      throughput: roundNumberTwoDecimals(responseTimes.length / ((timeStamps[timeStamps.length - 1] - timeStamps[0]) / 1000)),
      n9: calculateNthPercentil(orderedElapsedTime, 0.99),
      n5: calculateNthPercentil(orderedElapsedTime, 0.95),
      n0: calculateNthPercentil(orderedElapsedTime, 0.90),
    }
  })
  return JSON.stringify(result)
}


const calculateNthPercentil = (data, percentil) => {
  const percIndex = Math.ceil(percentil * data.length);
  const perc = data[percIndex - 1];
  return roundNumberTwoDecimals(perc);
}

const calculateAverage = (data) => {
  return data.reduce((a, b) => a + b, 0) / data.length
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
