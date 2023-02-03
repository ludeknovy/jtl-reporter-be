exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "charts" }, {
        histogram_plot_data: {
            type: "jsonb",
            "default": null,
            notNull: false,
        },
    })
}
