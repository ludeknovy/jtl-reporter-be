exports.up = (pgm) => {
  pgm.createTable({ schema: 'jtl', name: 'share_tokens' }, {
    id: {
      type: 'uuid',
      notNull: true,
      default: pgm.func('uuid_generate_v4()'),
      primaryKey: true
    },
    token: {
      type: 'text',
      notNull: true
    },
    name: {
      type: 'varchar(200)',
      notNull: false
    },
    item_id: {
      type: 'uuid',
      notNull: true,
      references: { schema: 'jtl', name: 'items', column: 'id' }
    }
  });
  pgm.createIndex({ schema: 'jtl', name: 'share_tokens' }, ['item_id']);

};
