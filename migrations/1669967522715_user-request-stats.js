/* eslint-disable camelcase */
exports.up = pgm => {
    pgm.createTable({ schema: "jtl", name: "user_scenario_settings" }, {
        id: {
            type: "serial",
        },
        scenario_id: {
            type: "uuid",
            notNull: true,
            constraints: [{
                onDelete: "CASCADE",
                foreignKeys: {
                    schema: "jtl", name: "scenario", column: "id",
                },
            }],
        },
        user_id: {
            type: "uuid",
            notNull: true,
            constraints: [{
                foreignKeys: {
                    onDelete: "CASCADE",
                    references: [{
                        schema: "jtl", name: "users", column: "id",
                    }],
                },
            }],
        },
        request_stats_settings: {
            type: "jsonb",
            not_null: true,
        },
    })

    pgm.addConstraint({ schema: "jtl", name: "user_scenario_settings" }, "user_id_scenario_id_pk", {
        primaryKey: ["user_id", "scenario_id"],
    })
}

