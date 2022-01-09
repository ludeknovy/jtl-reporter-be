exports.up = (pgm) => {
  pgm.addColumn({ schema: 'jtl', name: 'scenario' }, {
    keep_test_runs_period: {
      type: 'smallint',
      default: 0,
      notNull: true
    }
  });
};
