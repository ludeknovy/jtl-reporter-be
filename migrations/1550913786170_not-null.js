exports.up = (pgm) => {
  pgm.alterColumn({ schema: "jtl", name: "items" }, "scenario_id", { notNull: true })
  pgm.alterColumn({ schema: "jtl", name: "scenario" }, "project_id", { notNull: true })
  pgm.alterColumn({ schema: "jtl", name: "data" }, "item_id", { notNull: true })
};
