exports.up = (pgm) => {
  pgm.createTable({ schema: "jtl", name: "data" }, {
    id: {
      type: "uuid",
      notNull: true,
      default: pgm.func("uuid_generate_v4()"),
      constraints: {
        expression: "primaryKey"
      }
    },
    jtl_data: {
      type: "jsonb",
      notNull: true,
    },
    item_id: {
      type: "uuid",
      references: { schema: "jtl", name: "items", column: "id" }
    }
  });
};