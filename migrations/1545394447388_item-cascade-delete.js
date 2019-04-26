
exports.up = (pgm) => {
  pgm.dropConstraint( { schema: "jtl", name: "data" }, "data_item_id_fkey")

  pgm.addConstraint( { schema: "jtl", name: "data" }, "data_item_id_fkey", {
    foreignKeys: {
      columns: "item_id",
      references: { schema: "jtl", name: "items", column: "id" },
      onDelete: 'CASCADE'
    }
  } )
  pgm.dropConstraint( { schema: "jtl", name: "item_stat" }, "item_stat_item_id_fkey")

  pgm.addConstraint( { schema: "jtl", name: "item_stat" }, "item_stat_item_id_fkey", {
    foreignKeys: {
      columns: "item_id",
      references: { schema: "jtl", name: "items", column: "id" },
      onDelete: 'CASCADE'
    }
  } )
};




