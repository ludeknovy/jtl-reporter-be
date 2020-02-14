exports.up = (pgm) => {

    pgm.dropConstraint( { schema: "jtl", name: "api_tokens" }, "api_tokens_created_by_fkey")

    pgm.addConstraint( { schema: "jtl", name: "api_tokens" }, "api_tokens_created_by_fkey", {
      foreignKeys: {
        columns: "created_by",
        references: { schema: "jtl", name: "users", column: "id" },
        onDelete: 'CASCADE'
      }
    } )
};
