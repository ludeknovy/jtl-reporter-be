exports.up = (pgm) => {
    pgm.createType("role", ["admin", "operator", "readonly"] )
    pgm.addColumn({ schema: 'jtl', name: 'users' }, {
      role: {
        type: "role",
        default: "admin",
        notNull: true
      }
    });
  };
  