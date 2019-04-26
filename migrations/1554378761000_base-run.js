exports.up = (pgm) => {
  pgm.addColumn({ schema: "jtl", name: "items" }, {
    base: {
      type: 'boolean',
      default: null
    }
  });
};
