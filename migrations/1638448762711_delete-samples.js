exports.up = (pgm) => {
    pgm.addColumn({schema: 'jtl', name: 'scenario'}, {
        delete_samples: {
            type: 'boolean',
            default: false,
            notNull: true
        }
    });
};
