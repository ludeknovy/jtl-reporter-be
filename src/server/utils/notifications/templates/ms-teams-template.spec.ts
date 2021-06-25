import { msTeamsTemplate } from './ms-teams-template';

describe('MS Teams template', () => {
  const OVERVIEW = {
    percentil: 10,
    avgConnect: 1,
    avgLatency: 1,
    avgResponseTime: 1,
    duration: 1,
    endDate: new Date(),
    errorRate: 0,
    maxVu: 10,
    startDate: new Date(),
    throughput: 10,
    bytesPerSecond: 123234,
    bytesSentPerSecond: 12334
  };
  it('should return correct card payload when url provided', () => {
    const template = msTeamsTemplate('scenarioName', 'http://localhost', OVERVIEW);
    expect(template).toEqual({
      'type': 'message',
      'attachments': [
        {
          'contentType': 'application/vnd.microsoft.card.adaptive',
          'contentUrl': null,
          'content': {
            'type': 'AdaptiveCard',
            'body': [
              {
                'type': 'TextBlock',
                'size': 'Medium',
                'weight': 'Bolder',
                'text': 'Performance Report for scenario: scenarioName'
              },
              {
                'type': 'FactSet',
                'facts': [
                  { 'title': 'Error Rate', 'value': '0 %' },
                  { 'title': '90% percentile', 'value': '10 ms' },
                  { 'title': 'Throughput', 'value': '10 hits/s' },
                  { 'title': 'Duration', 'value': '1 min' }]
              }],
            'actions': [
              { 'type': 'Action.OpenUrl', 'title': 'View', 'url': 'http://localhost' }],
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'version': '1.2'
          }
        }]
    });
  });
  it('should return card payload when no url provided', () => {
    const template = msTeamsTemplate('scenarioName', undefined, OVERVIEW);
    expect(template).toEqual({
      'type': 'message',
      'attachments': [
        {
          'contentType': 'application/vnd.microsoft.card.adaptive',
          'contentUrl': null,
          'content': {
            'type': 'AdaptiveCard',
            'body': [
              {
                'type': 'TextBlock',
                'size': 'Medium',
                'weight': 'Bolder',
                'text': 'Performance Report for scenario: scenarioName'
              },
              {
                'type': 'FactSet',
                'facts': [
                  { 'title': 'Error Rate', 'value': '0 %' },
                  { 'title': '90% percentile', 'value': '10 ms' },
                  { 'title': 'Throughput', 'value': '10 hits/s' },
                  { 'title': 'Duration', 'value': '1 min' }]
              }],
            'actions': [],
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'version': '1.2'
          }
        }]
    });
  });
});
