exports.up = (pgm) => {
  pgm.createTable({ schema: 'jtl', name: 'user_item_chart_settings' }, {
    id: {
      type: 'uuid',
      notNull: true,
      default: pgm.func('uuid_generate_v4()'),
      primaryKey: true
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: { schema: 'jtl', name: 'users', column: 'id' }
    },
    item_id: {
      type: 'uuid',
      notNull: true,
      references: { schema: 'jtl', name: 'items', column: 'id' }
    },
    chart_settings: {
      type: 'jsonb',
      notNull: true
    }
  });
  pgm.createIndex(
    { schema: 'jtl', name: 'user_item_chart_settings' },
    ['item_id', 'user_id'],
    { name: 'user_item_chart_settings_user_id_item_id_key', unique: true });
};
