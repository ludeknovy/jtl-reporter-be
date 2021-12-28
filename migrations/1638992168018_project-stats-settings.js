exports.up = (pgm) => {
  pgm.addColumn({ schema: 'jtl', name: 'projects' }, {
    item_top_statistics_settings: {
      type: 'jsonb',
      default: JSON.stringify({
        'network': false,
        'errorRate': true,
        'avgLatency': true,
        'avgConnectionTime': false,
        'percentile': true,
        'throughput': true,
        'virtualUsers': true,
        'avgResponseTime': false
      }),
      notNull: false
    }
  });
};
