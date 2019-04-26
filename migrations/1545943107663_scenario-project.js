
exports.up = (pgm) => {
  pgm.db.select({
    text: `SELECT DISTINCT scenario_id, project_id
    FROM jtl.items;`
  }).then(result => {
    return Promise.all(result.map(_ => {
      return pgm.db.query({
        text: `UPDATE jtl.scenario SET project_id = $2 WHERE id = $1`,
        values: [_.scenario_id, _.project_id]
      })
    }))
  }).catch(e => console.log(e));
  pgm.dropColumns({ schema: "jtl", name: "items"}, ["project_id"]);
};