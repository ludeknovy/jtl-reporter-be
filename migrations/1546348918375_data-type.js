exports.up = (pgm) => {
  pgm.renameColumn({ schema: "jtl", name: "data"}, "jtl_data", "item_data");
  pgm.createType("data_type", ["kpi", "error"]);
  pgm.addColumns( { schema: "jtl", name: "data"}, {
    data_type: {
      type: "data_type"
    }
  });
};