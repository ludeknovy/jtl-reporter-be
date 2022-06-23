export const chartQueryOptionInterval = (duration: number): number => {
  const minimalInterval = 10
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const durationMillis = duration * 60 * 1000
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const interval = parseInt((Math.floor(100 * (durationMillis / 200)) / 100).toFixed(0), 10)
  // zero interval is causing subsequent query to fail - this is the case only for very short tests
  return interval === 0 ? minimalInterval : interval
}
