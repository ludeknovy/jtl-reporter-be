exports.up = (pgm) => {

  pgm.addColumn({ schema: 'jtl', name: 'items' }, {
    threshold_result: {
      type: 'jsonb'
    }
  });
};
