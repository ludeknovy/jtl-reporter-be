exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "projects" }, {
        upsert_scenario: {
            type: "boolean",
            "default": false,
            notNull: true,
        },
    })
}
