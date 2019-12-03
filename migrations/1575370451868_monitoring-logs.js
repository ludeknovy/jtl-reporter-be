exports.up = (pgm) => {
  pgm.alterColumn({ schema: "jtl", name: "data" }, "data_type", {
    type: "VARCHAR(255)"
  });
  pgm.dropType("data_type")
  pgm.createType("data_type", ["kpi", "error", "monitoring_logs"]);
  pgm.alterColumn({ schema: "jtl", name: "data" }, "data_type", {
    type: "data_type",
    using: "data_type::data_type"
  });
};

