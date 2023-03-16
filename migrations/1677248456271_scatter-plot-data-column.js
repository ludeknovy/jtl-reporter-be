exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "charts" }, {
        scatter_plot_data: {
            type: "jsonb",
            "default": null,
            notNull: false,
        },
    })
}
