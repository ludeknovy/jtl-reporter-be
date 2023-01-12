exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "scenario" }, {
        apdex_settings: {
            type: "jsonb",
            "default": JSON.stringify([]),
            notNull: false,
        },
    })
}
