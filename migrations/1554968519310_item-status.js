exports.up = (pgm) => {
  pgm.createType('item_status', ['0', '1', '2', '3', '10'] );

  pgm.addColumn({ schema: "jtl", name: "items" }, {
    status: {
      type: 'item_status',
      default: '10'
    }
  });
};
