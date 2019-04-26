exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.db.query({
    text: `
      INSERT INTO jtl.data (item_id, jtl_data)
      SELECT id, jtl_data
      FROM jtl.items
    `
  })
  pgm.dropColumns({ schema: "jtl", name: "items" }, 'jtl_data');
};