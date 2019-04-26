exports.up = (pgm) => {
  pgm.dropColumns( { schema: "jtl", name: "projects" }, ['deleted'] )

  pgm.dropConstraint( { schema: "jtl", name: "scenario" }, "scenario_project_id_fkey")


  pgm.addConstraint( { schema: "jtl", name: "scenario" }, "scenario_project_id_fkey", {
    foreignKeys: {
      columns: "project_id",
      references: { schema: "jtl", name: "projects", column: "id" },
      onDelete: 'CASCADE'
    }
  } )
};
