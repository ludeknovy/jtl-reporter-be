exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "items" }, {
        apdex_settings: {
            type: "jsonb",
            "default": null,
            notNull: false,
        },
    })
}
