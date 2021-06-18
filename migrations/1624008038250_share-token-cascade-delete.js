/* eslint-disable camelcase */
exports.up = (pgm) => {

    pgm.dropConstraint({ schema: "jtl", name: "share_tokens" }, "share_tokens_item_id_fkey")

    pgm.addConstraint({ schema: "jtl", name: "share_tokens" }, "share_tokens_item_id_fkey", {
        foreignKeys: {
            columns: "item_id",
            references: { schema: "jtl", name: "items", column: "id" },
            onDelete: 'CASCADE'
        }
    })

};


