exports.up = (pgm) => {
  pgm.db.query({
    text: `
      UPDATE jtl.data SET data_type = $1
    `,
    values: ['kpi']
  })
};