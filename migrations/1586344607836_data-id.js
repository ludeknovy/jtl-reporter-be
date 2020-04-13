exports.up = (pgm) => {
  pgm.addColumn({ schema: "jtl", name: "items" }, {
    data_id: {
      type: 'uuid',
      default: null
    }
  });
};
