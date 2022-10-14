exports.up = (pgm) => {
    pgm.createTable({ schema: "jtl", name: "execution_files" }, {
        id: {
            type: "uuid",
            notNull: true,
            default: pgm.func("uuid_generate_v4()"),
        },
        scenario_id: {
            type: "uuid",
            references: { schema: "jtl", name: "scenario" },
            notNull: true,
        },
        filename: {
            type: "varchar(200)",
            notNull: true,
        },
        content: {
            type: "bytea",
            notNull: true
        },
    })

}
