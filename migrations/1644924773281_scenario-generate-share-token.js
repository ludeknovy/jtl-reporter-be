exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "scenario" }, {
        generate_share_token: {
            type: "boolean",
            "default": false,
            notNull: true,
        },
    })
}
