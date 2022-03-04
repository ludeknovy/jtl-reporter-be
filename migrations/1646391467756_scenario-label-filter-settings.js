exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "scenario" }, {
        label_filter_settings: {
            type: "jsonb",
            "default": null,
            notNull: false,
        },
    })
}
