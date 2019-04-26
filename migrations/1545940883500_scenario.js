exports.up = (pgm) => {
  pgm.createTable({ schema: "jtl", name: "scenario" }, {
    id: {
      type: "uuid",
      notNull: true,
      default: pgm.func("uuid_generate_v4()"),
      primaryKey: true
    },
    name: {
      type: "varchar(50)",
      notNull: true,
    },
    project_id: {
      type: "uuid",
      references: { schema: "jtl", name: "projects", column: "id" }
    }
  });
};