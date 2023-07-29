exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "samples" }, {
        thread_name: {
            type: "varchar(350)",
            "default": null,
            notNull: false,
        },
    })
}
