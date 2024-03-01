exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "scenario" }, {
        min_test_duration: {
            type: "smallint",
            "default": 5,
            notNull: true,
        },
    })
}
