exports.up = (pgm) => {
  pgm.createTable({ schema: 'jtl', name: 'notifications' }, {
    id: {
      type: 'uuid',
      notNull: true,
      default: pgm.func('uuid_generate_v4()'),
      primaryKey: true
    },
    name: {
      type: 'varchar(100)',
      notNull: true
    },
    url: {
      type: 'varchar(400)',
      notNull: true
    },
    scenario_id: {
      type: 'uuid',
      notNull: true,
      references: { schema: 'jtl', name: 'scenario', column: 'id' }
    },
    type: {
      type: 'text',
      notNull: true
    }
  });
};
