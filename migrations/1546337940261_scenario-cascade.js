
exports.up = (pgm) => {
  pgm.dropConstraint( { schema: "jtl", name: "items" }, "items_scenario_id_fkey")


  pgm.addConstraint( { schema: "jtl", name: "items" }, "items_scenario_id_fkey", {
    foreignKeys: {
      columns: "scenario_id",
      references: { schema: "jtl", name: "scenario", column: "scenario_id" },
      onDelete: 'CASCADE'
    }
  } )
};




