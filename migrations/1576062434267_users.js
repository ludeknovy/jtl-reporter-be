exports.up = (pgm) => {
  pgm.createTable({ schema: "jtl", name: "users" }, {
    id: {
      type: "uuid",
      notNull: true,
      default: pgm.func("uuid_generate_v4()"),
      primaryKey: true
    },
    username: {
      type: "varchar(100)",
      unique: true,
    },
    password: {
      type: "varchar(100)",
    },
    create_date: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  });
};