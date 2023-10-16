/* eslint-disable camelcase */
exports.up = pgm => {
    pgm.createTable({ schema: "jtl", name: "global_settings" }, {
        id: {
            type: "serial",
        },
        project_auto_provisioning: {
            type: "boolean",
            "default": false,
            notNull: true,
        },
    })

}

