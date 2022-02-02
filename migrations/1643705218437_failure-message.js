exports.up = (pgm) => {
    pgm.addColumn({ schema: 'jtl', name: 'samples' }, {
      failure_message: {
        type: "VARCHAR",
        default: null,
      }
    });
  };
  