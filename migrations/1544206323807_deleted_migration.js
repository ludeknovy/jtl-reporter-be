exports.up = pgm => {
  pgm.addColumns({ schema: "jtl", name: "projects" }, {
    deleted: {
      type: 'boolean',
      default: false
    }
  });
};