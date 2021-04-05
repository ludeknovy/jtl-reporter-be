exports.up = (pgm) => {
  pgm.addColumn({ schema: 'jtl', name: 'item_stat' }, {
    sut: {
      type: 'jsonb',
      default: null
    }
  });
};
