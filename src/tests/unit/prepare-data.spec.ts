import { normalizeAndSortData, prepareDataForSavingToDb } from '../../server/data-stats/prepare-data';
import * as statistics from '../../server/data-stats/statistics';
const dataToBeSaved = require('./stubs/data-to-be-saved.json');
jest.mock('../../server/data-stats/statistics');


describe('Prepare data', () => {
  describe('prepareDataForSavingToDb', () => {
    let preparedData;
    let normalizeAndSortDataSpy;
    beforeEach(() => {
      jest.restoreAllMocks();
      normalizeAndSortDataSpy = jest.spyOn(
        require('../../server/data-stats/prepare-data'),
        'normalizeAndSortData');
      preparedData = prepareDataForSavingToDb(dataToBeSaved);
    });
    it('should prepare stats and itemOverview', async () => {
      expect(statistics.stats).toHaveBeenCalledTimes(1);
      expect(statistics.itemOverview).toHaveBeenCalledTimes(1);
    });
    it('should substract start time', async () => {
      const startTime = new Date(dataToBeSaved.sort((a, b) => a.timeStamp - b.timeStamp)[0].timeStamp);
      expect(preparedData.startTime).toEqual(startTime);
    });
    it('should prepare sorted data', async () => {
      expect(normalizeAndSortDataSpy).toHaveBeenCalledTimes(1);
    });
    it('should return object containing all keys', async () => {
      expect(preparedData).toHaveProperty('itemStats');
      expect(preparedData).toHaveProperty('overview');
      expect(preparedData).toHaveProperty('startTime');
      expect(preparedData).toHaveProperty('sortedData');
    });
  });
  describe('normalizeAndSortData', () => {
    it('should transfer strings to numbers and sort data chronologically', async () => {
      const data = normalizeAndSortData(dataToBeSaved);
      data.forEach((value, index, array) => {
        expect(typeof value.timeStamp).toBe('number');
        expect(typeof value.elapsed).toBe('number');
        expect(typeof value.responseCode).toBe('number');
        expect(typeof value.bytes).toBe('number');
        expect(typeof value.grpThreads).toBe('number');
        expect(typeof value.allThreads).toBe('number');
        expect(typeof value.Latency).toBe('number');
        expect(typeof value.Connect).toBe('number');

        if (index !== (array.length - 1)) {
          expect(value.timeStamp).toBeLessThanOrEqual(array[index + 1].timeStamp);
        }
      });
    });
  });
});
