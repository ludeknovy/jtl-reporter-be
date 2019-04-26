exports.up = (pgm) => {
  pgm.addColumns({ schema: "jtl", name: "items"}, {
    scenario_id: {
      type: "uuid",
      references: { schema: "jtl", name: "scenario", column: "id" }
    }
  });
  pgm.db.select({
    text: `SELECT DISTINCT name, id
    FROM jtl.scenario`
  }).then(_ => {
    return Promise.all(_.map(__ => {
      return pgm.db.query({
        text: `UPDATE jtl.items SET scenario_id = $1 WHERE test_name = $2`,
        values: [__.id, __.name]
      })
    })).catch(e => console.log(e))
  });
};

