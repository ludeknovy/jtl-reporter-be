/* eslint-disable camelcase */
exports.up = pgm => {
    pgm.createTable({ schema: "jtl", name: "user_project_access" }, {
        id: "id",
        project_id: {
            type: "uuid",
            notNull: true,
            constraints: [{
                onDelete: "CASCADE",
                foreignKeys: {
                    schema: "jtl", name: "projects", column: "id",
                },
            }],
        },
        user_id: {
            type: "uuid",
            notNull: true,
            constraints: [{
                foreignKeys: {
                    onDelete: "CASCADE",
                    references: [{
                        schema: "jtl", name: "users", column: "id",
                    }],
                },
            }],
        },
    })
}

