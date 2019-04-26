exports.up = (pgm) => {
  pgm.addColumns({ schema: "jtl", name: "item_stat" }, {
    overview: {
      type: 'jsonb',
    }
  });
};
