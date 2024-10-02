/* eslint-disable camelcase */
const { PgLiteral } = require("node-pg-migrate")
exports.up = pgm => {
    pgm.createTable({ schema: "jtl", name: "global" }, {
        instance: {
            type: "uuid",
            "default": new PgLiteral("uuid_generate_v4()"),
            notNull: true,
        },
    })
}
