export const calculateNthPercentil = (data, percentil) => {
  const percIndex = Math.ceil((percentil / 100) * data.length);
  const perc = data[percIndex - 1];
  return roundNumberTwoDecimals(perc);
}

export const calculateAverageTime = (data) => {
  return calculateAverage(data);
}

export const calculateAverage = (data) => {
  return data.reduce((a, b) => a + b, 0) / data.length
}

export const calculateErrorRate = (data) => {
  const numberNonOkCodes = data.filter(_ => _.success === "false");
  const rate = (numberNonOkCodes.length / data.length) * 100
  return roundNumberTwoDecimals(rate);
}

export const calculateThroughput = data => {
  const startTime = data[0].timeStamp
  const endTime = data[data.length - 1].timeStamp
  const totalTimeInSeconds = (endTime - startTime) / 1000;
  const throughput = data.length / totalTimeInSeconds
  return roundNumberTwoDecimals(throughput)
}

export const roundNumberTwoDecimals = number => {
  return Math.round(number * 100) / 100;
}

export const findMinMax = data => {
  return data.reduce((previousValue, currentValue) => {
    previousValue.max = previousValue.max > currentValue ? previousValue.max : currentValue
    previousValue.min = previousValue.min < currentValue ?
      previousValue.min : currentValue
    return previousValue;
  }, { min: undefined, max: undefined });
};