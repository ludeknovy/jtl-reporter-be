exports.up = (pgm) => {
  pgm.addColumn({ schema: 'jtl', name: 'scenario' }, {
    threshold_enabled: {
      type: 'boolean',
      default: false,
      notNull: true
    },
    threshold_error_rate: {
      type: 'numeric',
      default: 5,
      notNull: true
    },
    threshold_percentile: {
      type: 'numeric',
      default: 5,
      notNull: true
    },
    threshold_throughput: {
      type: 'numeric',
      default: 5,
      notNull: true
    }
  });
};
