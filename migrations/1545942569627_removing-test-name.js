exports.up = (pgm) => {
  pgm.dropColumns({ schema: "jtl", name: "items"}, ["test_name"]);
};

