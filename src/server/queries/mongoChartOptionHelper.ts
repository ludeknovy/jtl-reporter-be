export const chartQueryOptionInterval = (duration: number): number => {
  const durationMillis = duration * 60 * 1000;
  const interval = parseInt((Math.floor(100 * (durationMillis / 200)) / 100).toFixed(0), 10);
  return interval;
};
