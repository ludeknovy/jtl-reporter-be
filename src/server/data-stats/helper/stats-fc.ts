export const roundNumberTwoDecimals = number => {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return Math.round(number * 100) / 100
}

export const findMinMax = data => {
  return data.reduce((previousValue, currentValue) => {
    previousValue.max = previousValue.max > currentValue ? previousValue.max : currentValue
    previousValue.min = previousValue.min < currentValue ?
      previousValue.min : currentValue
    return previousValue
  }, { min: undefined, max: undefined })
}
