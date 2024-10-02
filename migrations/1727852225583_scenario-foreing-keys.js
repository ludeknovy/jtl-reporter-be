
exports.up = (pgm) => {
    pgm.dropConstraint({ schema: "jtl", name: "notifications" }, "notifications_scenario_id_fkey")
    pgm.addConstraint({ schema: "jtl", name: "notifications" }, "notifications_scenario_id_fkey", {
        foreignKeys: {
            columns: "scenario_id",
            references: {
                schema: "jtl", name: "scenario", column: "id",
            },
            onDelete: "CASCADE",
        },
    })
    pgm.dropConstraint({ schema: "jtl", name: "scenario_share_tokens" }, "scenario_share_tokens_scenario_id_fkey")
    pgm.addConstraint({ schema: "jtl", name: "scenario_share_tokens" }, "scenario_share_tokens_scenario_id_fkey", {
        foreignKeys: {
            columns: "scenario_id",
            references: {
                schema: "jtl", name: "scenario", column: "id",
            },
            onDelete: "CASCADE",
        },
    })

}
