exports.up = (pgm) => {
  pgm.addColumn({ schema: 'jtl', name: 'scenario' }, {
    zero_error_tolerance_enabled: {
      type: 'boolean',
      default: false,
      notNull: true
    }
  });
};
