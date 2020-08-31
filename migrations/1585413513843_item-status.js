/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createType("report_status", ["in_progress", "error", "ready"]);

  pgm.addColumn({ schema: "jtl", name: "items" }, {
    report_status: {
      type: 'report_status',
      default: 'ready',
      notNull: true
    }
  });
};

