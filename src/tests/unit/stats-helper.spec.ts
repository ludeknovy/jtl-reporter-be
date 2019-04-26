import {
  calculateNthPercentil,
  roundNumberTwoDecimals, findMinMax,
  calculateErrorRate,
  calculateThroughput,
  calculateAverage,
  calculateAverageTime
} from '../../server/data-stats/helper/stats-fc';
const dbData = require('./stubs/saved-data.json');


describe('Stats Helper', () => {
  describe('calculateNthPercentil', () => {
    const inputData = [10, 55, 50, 80, 85, 90, 20, 40, 55, 65, 30, 25];
    it.each([
      [50, 50],
      [90, 85],
      [95, 90]
    ])('should correctly count %s nth percentil', (input, expectedNumber) => {
      const sortedInputData = inputData.sort((a, b) => a - b);
      const perc = calculateNthPercentil(sortedInputData, input);
      expect(perc).toBe(expectedNumber);
    });
  });

  describe('roundNumberTwoDecimals', () => {
    it.each([
      [0.1, 0.1],
      [100, 100],
      [0.12, 0.12],
      [3.123, 3.12]])('should correctly round %s', (input, expectedNumber) => {
        const roundedNumber = roundNumberTwoDecimals(input);
        expect(roundedNumber).toBe(expectedNumber);
      });
  });
  describe('findMinMax', () => {
    it('should correctly return min and max', () => {
      const testData = [-1, 3, 0, 2, -0.1, 1000, 1000.1, 12, 0.1];
      const { min, max } = findMinMax(testData);
      expect(min).toBe(-1);
      expect(max).toBe(1000.1);
    });
  });
  describe('calculateErrorRate', () => {
    it('should correctly calculate error rate', () => {
      const errorRate = calculateErrorRate(dbData);
      expect(errorRate).toBe(55.32);
    });
  });
  describe('calculateThroughput', () => {
    it('should correctly calculate throughput', () => {
      const throughput = calculateThroughput(dbData);
      expect(throughput).toBe(4);
    });
  });
  describe('calculateAverageTime', () => {
    it('should call calculateAverage function', () => {
      const spy = jest.spyOn(require('../../server/data-stats/helper/stats-fc'), 'calculateAverage');
      calculateAverageTime(dbData);
      expect(spy).toBeCalled();
    });
  });
  describe('calculateAverage', () => {
    it('should correctly calculate calculateAverage', () => {
      const average = calculateAverage([1, 5, 20, 0, 100]);
      expect(average).toBe(25.2);
    });
  });
});
