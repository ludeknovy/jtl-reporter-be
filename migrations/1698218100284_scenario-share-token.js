const { PgLiteral } = require("node-pg-migrate")
exports.up = (pgm) => {
    pgm.createTable({ schema: "jtl", name: "scenario_share_tokens" }, {
        id: {
            type: "uuid",
            "default": new PgLiteral("uuid_generate_v4()"),
            notNull: true,
            primaryKey: true,
        },
        token: {
            type: "text",
            notNull: true,
            "default": null,
        },
        note: {
            type: "varchar(200)",
            notNull: true,
            "default": null,
        },
        created_by: {
            type: "uuid",
            "default": null,
            references: { schema: "jtl", name: "users" },
            notNull: true,
        },
        scenario_id: {
            type: "uuid",
            "default": null,
            references: { schema: "jtl", name: "scenario" },
            notNull: true,
        },
    })
}
