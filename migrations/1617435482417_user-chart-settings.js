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
      references: { schema: 'jtl', name: 'users', column: 'id' }
    },
    item_id: {
      type: 'uuid',
      references: { schema: 'jtl', name: 'items', column: 'id' }
    },
    chart_settings: {
      type: 'jsonb',
      notNull: true
    }
  });
  pgm.createIndex(
    { schema: 'jtl', name: 'user_item_chart_settings' },
    ['user_id', 'item_id'],
    { name: 'user_item_chart_settings_user_id_item_id_key', unique: true });
  pgm.addConstraint(
    { schema: 'jtl', name: 'user_item_chart_settings' },
    'user_item_chart_settings_user_id_item_id_constraint',
    {
      unique: ['user_id', 'item_id']
    });

};
