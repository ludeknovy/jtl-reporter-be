exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "charts" }, {
        extra_plot_data: {
            type: "jsonb",
            "default": null,
            notNull: false,
        },
    })
    pgm.addColumn({ schema: "jtl", name: "scenario" }, {
        extra_aggregations: {
            type: "boolean",
            "default": false,
            notNull: true,
        },
    })
}
