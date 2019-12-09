exports.up = (pgm) => {
    pgm.createTable({ schema: "jtl", name: "api_tokens" }, {
      id: {
        type: "uuid",
        notNull: true,
        default: pgm.func("uuid_generate_v4()"),
        primaryKey: true
      },
      token: {
        type: "varchar(100)",
        unique: true,
      },
      description: {
        type: "varchar(200)",
        notNull: true,
      },
      created_by: {
        type: "uuid",
        notNull: true,
        references: { schema: "jtl", name: "users", column: "id" }
      },
      create_date: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('current_timestamp'),
      }
    });
  };