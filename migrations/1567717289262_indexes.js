exports.up = (pgm) => {
  pgm.createIndex({ schema: "jtl", name: "data" }, `item_id`);
  pgm.createIndex({ schema: "jtl", name: "scenario" }, [`id`, `project_id`, `name`]);
  pgm.createIndex({ schema: "jtl", name: "projects" }, [`id`, `project_name`]);
  pgm.createIndex({ schema: "jtl", name: "items" }, [`id`, `scenario_id`]);
  pgm.createIndex({ schema: "jtl", name: "item_stat" }, [`item_id`]);
};

