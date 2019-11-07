exports.up = (pgm) => {
  pgm.addColumns( { schema: "jtl", name: "items"}, {
    hostname: {
      type: "varchar(200)"
    }
  });
};