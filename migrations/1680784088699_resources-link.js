exports.up = (pgm) => {
    pgm.addColumn({ schema: "jtl", name: "items" }, {
        resources_link: {
            type: "varchar(350)",
            "default": null,
            notNull: false,
        },
    })
}
