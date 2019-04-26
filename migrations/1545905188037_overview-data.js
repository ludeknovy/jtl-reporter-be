exports.up = (pgm) => {
  pgm.db.select({
    text: `
      SELECT jtl_data, item_id
      FROM jtl.data;
    `
  }).then((result) => {
    return Promise.all(result.map(_ => {
      return pgm.db.query({
        text: `
          UPDATE jtl.item_stat
          SET overview = $2
          WHERE item_id = $1`,
        values: [_.item_id, itemOverview(_.jtl_data)]
      }).then(res => res)
        .catch(e => console.log(e))
    })).catch(e => console.log(e))
    .then(res => res)
  })
};


const itemOverview = data => {
  const cleanData = data.filter(_ => _.success === 'true')
  const orderedElapsedTime = cleanData.slice().sort((a, b) => a.elapsed - b.elapsed).map(_ => _.elapsed);
  const ninetyPercentilResponseTime = calculateNthPercentil(orderedElapsedTime, 0.90);
  const maxVu = Math.max(...cleanData.map(_ => _.allThreads));
  const avgResponseTime = Math.round(calculateAverageTime(orderedElapsedTime));
  const errorRate = calculateErrorRate(data);
  const throughput = calculateThroughput(data);
  const avgLatency = calculateAverage(cleanData.map(_ => _.Latency)).toFixed(0);
  const startDate = new Date(data[0].timeStamp);
  const endDate = new Date(data[cleanData.length - 1].timeStamp);
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