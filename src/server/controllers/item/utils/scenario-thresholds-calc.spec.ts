import { scenarioThresholdsCalc } from './scenario-thresholds-calc';

describe('scenarioThresholdsCalc', () => {
  const SCENARIO_AVERAGE = {
    percentile: 35.33,
    throughput: 462.39,
    errorRate: 0.0
  };
  it('should return false, when response time threshold exceeded', () => {
    const output = scenarioThresholdsCalc({
      percentil: 40,
      errorRate: 0.0,
      throughput: 462.39
    } as any, SCENARIO_AVERAGE, {
      errorRate: '5', percentile: '5', throughput: '5'
    });
    expect(output.passed).toBe(false);
    expect(output.result.percentile.passed).toBe(false);
  });
  it('should return true, when response time threshold not exceeded', () => {
    const output = scenarioThresholdsCalc({
      percentil: 36,
      errorRate: 0.0,
      throughput: 462.39
    } as any, SCENARIO_AVERAGE, {
      errorRate: '5', percentile: '5', throughput: '5'
    });
    expect(output.passed).toBe(true);
    expect(output.result.percentile.passed).toBe(true);

  });
  it('should return false, when throughput threshold exceeded', () => {
    const output = scenarioThresholdsCalc({
      percentil: 35,
      errorRate: 0.0,
      throughput: 435
    } as any, SCENARIO_AVERAGE, {
      errorRate: '5', percentile: '5', throughput: '5'
    });
    expect(output.passed).toBe(false);
    expect(output.result.throughput.passed).toBe(false);
  });
  it('should return true, when throughput threshold not exceeded', () => {
    const output = scenarioThresholdsCalc({
      percentil: 35,
      errorRate: 0.0,
      throughput: 450
    } as any, SCENARIO_AVERAGE, {
      errorRate: '5', percentile: '5', throughput: '5'
    });
    expect(output.passed).toBe(true);
    expect(output.result.throughput.passed).toBe(true);

  });
  it('should return false, when errorRate threshold exceeded and scenario average is zero', () => {
    const output = scenarioThresholdsCalc({
      percentil: 35,
      errorRate: 10.0,
      throughput: 462.39
    } as any, SCENARIO_AVERAGE, {
      errorRate: '5', percentile: '5', throughput: '5'
    });
    expect(output.passed).toBe(false);
    expect(output.result.errorRate.passed).toBe(false);
  });
  it('should return false, when errorRate threshold exceeded and scenario average is not zero', () => {
    const output = scenarioThresholdsCalc({
      percentil: 35,
      errorRate: 10.0,
      throughput: 462.39
    } as any, {
      percentile: 35.33,
      throughput: 462.39,
      errorRate: 1.0
    }, {
      errorRate: '5', percentile: '5', throughput: '5'
    });
    expect(output.passed).toBe(false);
    expect(output.result.errorRate.passed).toBe(false);
  });
  it('should return true, when errorRate threshold not exceeded and scenario average is zero', () => {
    const output = scenarioThresholdsCalc({
      percentil: 35,
      errorRate: 4.0,
      throughput: 462.39
    } as any, SCENARIO_AVERAGE, {
      errorRate: '5', percentile: '5', throughput: '5'
    });
    expect(output.passed).toBe(true);
    expect(output.result.errorRate.passed).toBe(true);
  });
  it('should return true, when errorRate threshold not exceeded and scenario average is not zero', () => {
    const output = scenarioThresholdsCalc({
      percentil: 35,
      errorRate: 0.0,
      throughput: 462.39
    } as any, {
      percentile: 35.33,
      throughput: 462.39,
      errorRate: 1.0
    }, {
      errorRate: '5', percentile: '5', throughput: '5'
    });
    expect(output.passed).toBe(true);
    expect(output.result.errorRate.passed).toBe(true);
  });
});
