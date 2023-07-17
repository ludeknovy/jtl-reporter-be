exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "item_stat" }, {
        errors: {
            type: "jsonb",
            "default": null,
            notNull: false,
        },
    })
}
