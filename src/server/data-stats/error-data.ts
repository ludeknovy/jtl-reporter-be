export const normalizeErrorData = (rawErrorData) => {
  // group data by label
  const groupedData = rawErrorData.reduce((accumulator, current) => {
    (accumulator[current['lb']] = accumulator[current['lb']] || []).push(current);
    return accumulator;
  }, {});
  const groupedDataArray = [];
  for (const k in groupedData) {
    groupedDataArray.push({ label: k, data: groupedData[k] });
  }
  return groupedDataArray;
};
