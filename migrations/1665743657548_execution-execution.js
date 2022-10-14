exports.up = (pgm) => {
    pgm.createTable({ schema: "jtl", name: "execution" }, {
        id: {
            type: "uuid",
            notNull: true,
            primaryKey: true,
        },
        scenario_id: {
            type: "uuid",
            references: { schema: "jtl", name: "scenario" },
            notNull: true,
        },
        status: {
            type: "varchar(50)",
            notNull: true,
        },
        pid: {
            type: "varchar(20)",
            notNull: false,
        },
        start_date: {
            type: "timestamp",
            notNull: false,
        },
        start_date: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("now()"),
        },
        end_date: {
            type: "timestamp",
            notNull: false,
        }
    })

}
