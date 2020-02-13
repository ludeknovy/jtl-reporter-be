import { roundNumberTwoDecimals } from './helper/stats-fc';

export const chunkData = inputData => {
  const timestampSortedData = inputData.sort((a, b) => a.timeStamp - b.timeStamp);
  const labelSet = [...new Set(inputData.map(_ => _.label))];
  const numberOfIntervals = (inputData.length / labelSet.length) > 500 ? 200 : 75;
  const totalDuration =
    (timestampSortedData[timestampSortedData.length - 1].timeStamp - timestampSortedData[0].timeStamp);
  const startTime = timestampSortedData[0].timeStamp;
  const pointInterval = totalDuration / numberOfIntervals;
  const intervals = [startTime];
  for (let interval = 0; interval < numberOfIntervals; interval++) {
    const lastInterval = intervals[intervals.length - 1];
    interval === numberOfIntervals - 1
      ? intervals.push(timestampSortedData[timestampSortedData.length - 1].timeStamp)
      : intervals.push(lastInterval + pointInterval);
  }
  const intervalsIndex = Array.apply(null, { length: numberOfIntervals + 1 }).map(Number.call, Number);
  const groupedData = timestampSortedData.reduce((accumulator, item) => {
    let index = intervalsIndex[0];
    if (item.timeStamp > intervals[index]) {
      intervalsIndex.shift();
      index = intervalsIndex[0];
    }
    if (!accumulator[index]) {
      accumulator[index] = [];
    }
    accumulator[index].push(item);
    return accumulator;
  }, []);


  let averages = groupedData
    .map(_ => {
      const startTime = _[0].timeStamp;
      const endTime = _.length > 1 ? _[_.length - 1].timeStamp : startTime;
      const duration = ((endTime - startTime) / 1000);
      const avgResults = _.reduce((accumulator, { label, elapsed, success }) => {
        accumulator[label] = accumulator[label] || { sum: 0, count: 0, failedCount: 0, label };
        accumulator[label].sum += + elapsed;
        accumulator[label].failedCount += success === 'false' ? +1 : +0;
        accumulator[label].average = Math.round(accumulator[label].sum / ++accumulator[label].count);
        accumulator[label].throughput = duration === 0
          ? 0
          : Math.round((accumulator[label].count / duration) * 100) / 100;
        return accumulator;
      }, {});
      return Object.keys(avgResults).map(k => avgResults[k]);
    });

  // if interval does not contain label it creates it with either null or 0 values
  averages = averages.map((a, index) => {
    const fixedData = [];
    labelSet.forEach((label) => {
      const found = a.find((_) => _.label === label);
      if (!found) {
        fixedData.push({
          sum: index === 0 ? 0 : null,
          count: index === 0 ? 0 : null,
          failedCount: index === 0 ? 0 : null,
          label,
          average: index === 0 ? 0 : null,
          throughput: index === 0 ? 0 : null
        });
      } else {
        fixedData.push(found);

      }
    });
    return fixedData;
  });


  const overallAverage = averages.map(_ => {
    const sum = _.reduce((accumulator, currentValue) => {
      accumulator.responseTimeSum = currentValue.average + accumulator.responseTimeSum;
      accumulator.throughputSum = currentValue.throughput + accumulator.throughputSum;
      accumulator.failedCount = currentValue.failedCount + accumulator.failedCount;
      accumulator.totalCount = currentValue.count + accumulator.totalCount;
      return accumulator;
    }, { responseTimeSum: 0, throughputSum: 0, failedCount: 0, totalCount: 0 });
    return {
      averageResponseTime: Math.round((sum.responseTimeSum / _.length) * 100) / 100,
      errorRate: roundNumberTwoDecimals((sum.failedCount / sum.totalCount) * 100),
      throughput: Math.round(sum.throughputSum * 100) / 100
    };
  }).map((_, index) => {
    return { ..._, time: intervals[index] };
  });

  // flattening arrays
  const flatData: any[] = labelSet.map((label) => {
    return [].concat(...averages.map((_) =>
      [].concat(..._.filter(__ => __.label === label))));
  });


  const series = [].concat(...flatData.map(_ => {
    return _.map((__, index) => {
      return {
        time: intervals[index],
        average: __.average,
        throughput: __.throughput,
        name: __.label
      };
    });
  }));

  const overallThroughput: any = {
    name: 'throughput',
    data: [...overallAverage.map(_ => [_.time, _.throughput])]
  };


  const overallTimeResponse: any = {
    name: 'response time',
    data: [...overallAverage.map(_ => [_.time, _.averageResponseTime])]
  };

  const overAllFailRate: any = {
    name: 'errors',
    data: [...overallAverage.map(_ => [_.time, _.errorRate])]
  };

  const responseTimeData: any[] = labelSet.map(_ => {
    const labelData = series.filter(__ => __.name === _);
    return {
      name: _,
      data: [...labelData.map(_ => [_.time, _.average])],
    };
  });

  const throughputData: any[] = labelSet.map(_ => {
    const labelData = series.filter(__ => __.name === _);
    return {
      name: _,
      data: [...labelData.map(_ => [_.time, _.throughput])],
    };
  });

  // threads
  const avgThreads = groupedData.map(_ => {
    const avgThread = _.reduce((acc, { allThreads }) => {
      return acc + allThreads;
    }, 0) / _.length;
    return Math.floor(avgThread);
  }).map((_, index) => {
    return [intervals[index], _];
  });


  const chart = {
    responseTime: responseTimeData,
    throughput: throughputData,
    overallThroughput,
    overallTimeResponse,
    overAllFailRate,
    threads: avgThreads
  };

  return chart;
};
