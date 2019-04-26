exports.up = (pgm) => {
  pgm.alterColumn({ schema: "jtl", name: "items" }, "environment", {
    type: "varchar(100)"
  })
};