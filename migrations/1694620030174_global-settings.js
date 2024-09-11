/* eslint-disable camelcase */
exports.up = pgm => {
    pgm.createTable({ schema: "jtl", name: "global" }, {
        instance_id: {
            type: "boolean",
            "default": false,
            notNull: true,
        },
    })

}

