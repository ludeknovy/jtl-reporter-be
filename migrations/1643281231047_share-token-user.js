exports.up = (pgm) => {
    pgm.addColumn({ schema: 'jtl', name: 'share_tokens' }, {
      created_by: {
        type: "uuid",
        default: null,
        references: { schema: "jtl", name: "users"},
        notNull: false
      }
    });
  };
  