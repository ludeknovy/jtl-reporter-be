exports.up = (pgm) => {
    pgm.createTable({ schema: "jtl", name: "execution_logs" }, {
        id: {
            type: "uuid",
            notNull: true,
            default: pgm.func("uuid_generate_v4()"),
        },
        execution_id: {
            type: "uuid",
            references: { schema: "jtl", name: "execution" },
            notNull: true,
        },
        log: {
            type: "varchar(500)",
            notNull: true,
        },
        level: {
            type: "varchar(50)",
            notNull: true,
        },
    })

}
