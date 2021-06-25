exports.up = (pgm) => {
  pgm.addColumn({ schema: 'jtl', name: 'scenario' }, {
    analysis_enabled: {
      type: 'boolean',
      default: true,
      notNull: true
    }
  });
};
